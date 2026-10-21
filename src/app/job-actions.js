'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { hashContent } from '@/lib/ai/evaluate';
import { extractSkills, guessTitle } from '@/lib/jobs/extract';
import { buildPlan } from '@/lib/jobs/plan';
import {
  JD_MAX_LENGTH, JD_MIN_LENGTH, MAX_ANSWER_LENGTH, MAX_JOB_TARGETS, MIN_ANSWER_LENGTH,
  MIN_SKILLS_REQUIRED, MOCK_MAX_MINUTES, MOCK_MIN_MINUTES, MOCK_MIN_QUESTIONS, MOCK_QUESTIONS,
} from '@/lib/constants';

async function requireUser() {
  const user = await getOrCreateUser();
  if (!user) throw new Error('You need to sign in first.');
  return user;
}

const clean = (v, max) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');
const slimSkills = (skills) =>
  skills.map(({ key, label, importance, weight, mentions, evidence }) => ({ key, label, importance, weight, mentions, evidence }));

/* ---------- Roles ---------- */

export async function createJobTarget({ title, company, jdText }) {
  const user = await requireUser();

  const text = String(jdText ?? '').replace(/\r\n/g, '\n').trim();
  if (text.length < JD_MIN_LENGTH) return { ok: false, error: 'Paste the full job description. This one is too short to read skills from.' };
  if (text.length > JD_MAX_LENGTH) return { ok: false, error: `Job descriptions can be up to ${JD_MAX_LENGTH.toLocaleString()} characters. Remove the company boilerplate and try again.` };

  const count = await prisma.jobTarget.count({ where: { userId: user.id } });
  if (count >= MAX_JOB_TARGETS) return { ok: false, error: `You can track up to ${MAX_JOB_TARGETS} roles. Delete one to add another.` };

  const skills = extractSkills(text);
  if (skills.length < MIN_SKILLS_REQUIRED) {
    return { ok: false, error: 'We could not find AI or ML skills in this text. Make sure you pasted the full description, including requirements.' };
  }

  const { items, coverage } = await buildPlan(skills);
  if (!items.length) {
    return { ok: false, error: 'None of the skills in this job are covered by the question bank yet, so we could not build a plan.' };
  }

  const job = await prisma.jobTarget.create({
    data: {
      userId: user.id,
      title: clean(title, 120) || clean(guessTitle(text), 120) || 'Untitled role',
      company: clean(company, 80) || null,
      jdText: text,
      skills: slimSkills(skills),
      coverage,
      planItems: { create: items },
    },
    select: { id: true },
  });

  revalidatePath('/jobs');
  revalidatePath('/dashboard');
  return { ok: true, id: job.id };
}

/** Rebuilds the plan from the saved job description, for example after new questions were added to the bank. */
export async function regeneratePlan(jobId) {
  const user = await requireUser();
  const job = await prisma.jobTarget.findFirst({ where: { id: String(jobId), userId: user.id }, select: { id: true, jdText: true } });
  if (!job) return { ok: false, error: 'Role not found.' };

  const skills = extractSkills(job.jdText);
  const { items, coverage } = await buildPlan(skills);
  if (!items.length) return { ok: false, error: 'No matching questions were found.' };

  await prisma.$transaction([
    prisma.jobPlanItem.deleteMany({ where: { jobId: job.id } }),
    prisma.jobTarget.update({
      where: { id: job.id },
      data: { skills: slimSkills(skills), coverage, planItems: { create: items } },
    }),
  ]);

  revalidatePath(`/jobs/${job.id}`);
  return { ok: true };
}

export async function deleteJobTarget(jobId) {
  const user = await requireUser();
  await prisma.jobTarget.deleteMany({ where: { id: String(jobId), userId: user.id } });
  revalidatePath('/jobs');
  revalidatePath('/dashboard');
  return { ok: true };
}

/* ---------- Mock assessment ---------- */

/**
 * Picks questions from the role's plan: one per important skill first, preferring questions the user has
 * not answered yet (a mock should not be a recall test). Production challenges are practised on their own.
 */
export async function startMock(jobId) {
  const user = await requireUser();
  const job = await prisma.jobTarget.findFirst({
    where: { id: String(jobId), userId: user.id },
    select: {
      id: true, skills: true,
      planItems: {
        orderBy: { priority: 'asc' },
        select: { problemId: true, skillKeys: true, problem: { select: { difficulty: true, estimatedMinutes: true, isChallenge: true, published: true } } },
      },
    },
  });
  if (!job) return { ok: false, error: 'Role not found.' };

  const eligible = job.planItems.filter((i) => i.problem.published && !i.problem.isChallenge);
  if (eligible.length < MOCK_MIN_QUESTIONS) {
    return { ok: false, error: `The mock needs at least ${MOCK_MIN_QUESTIONS} written questions in your plan. Refresh the plan after more questions are added.` };
  }

  const answered = new Set(
    (await prisma.submission.findMany({ where: { userId: user.id, problemId: { in: eligible.map((i) => i.problemId) } }, select: { problemId: true } })).map((s) => s.problemId),
  );
  const pool = [...eligible].sort((a, b) => Number(answered.has(a.problemId)) - Number(answered.has(b.problemId)));

  const skills = [...(Array.isArray(job.skills) ? job.skills : [])].sort((a, b) => b.weight - a.weight);
  const picked = [];
  const used = new Set();
  for (let pass = 0; pass < MOCK_QUESTIONS && picked.length < MOCK_QUESTIONS; pass += 1) {
    for (const s of skills) {
      if (picked.length >= MOCK_QUESTIONS) break;
      const hit = pool.find((i) => !used.has(i.problemId) && i.skillKeys.includes(s.key));
      if (hit) {
        used.add(hit.problemId);
        picked.push(hit);
      }
    }
  }
  for (const i of pool) {
    if (picked.length >= MOCK_QUESTIONS) break;
    if (!used.has(i.problemId)) {
      used.add(i.problemId);
      picked.push(i);
    }
  }

  const minutes = picked.reduce((a, i) => a + i.problem.estimatedMinutes, 0);
  const durationMinutes = Math.min(MOCK_MAX_MINUTES, Math.max(MOCK_MIN_MINUTES, Math.round(minutes / 5) * 5));

  // Only one open mock per role. Starting again replaces an abandoned one.
  const [, mock] = await prisma.$transaction([
    prisma.mockAssessment.deleteMany({ where: { jobId: job.id, userId: user.id, status: 'IN_PROGRESS' } }),
    prisma.mockAssessment.create({
      data: { jobId: job.id, userId: user.id, problemIds: picked.map((i) => i.problemId), durationMinutes },
      select: { id: true },
    }),
  ]);

  revalidatePath(`/jobs/${job.id}`);
  return { ok: true, id: mock.id };
}

/** Saves the mock answers as the user's submissions. Feedback is requested afterwards, one question at a time. */
export async function submitMock(mockId, answers) {
  const user = await requireUser();
  const mock = await prisma.mockAssessment.findFirst({ where: { id: String(mockId), userId: user.id }, select: { id: true, status: true, problemIds: true } });
  if (!mock) return { ok: false, error: 'Mock not found.' };
  if (mock.status !== 'IN_PROGRESS') return { ok: false, error: 'This mock is already finished.' };

  const saved = [];
  for (const problemId of mock.problemIds) {
    const text = String(answers?.[problemId] ?? '').trim().slice(0, MAX_ANSWER_LENGTH);
    if (text.length < MIN_ANSWER_LENGTH) continue;
    const key = { userId_problemId: { userId: user.id, problemId } };
    await prisma.$transaction([
      prisma.submission.upsert({ where: key, update: { content: text }, create: { userId: user.id, problemId, content: text } }),
      prisma.problemProgress.upsert({
        where: key,
        update: { lastActivityAt: new Date() }, // never downgrades a completed problem
        create: { userId: user.id, problemId, status: 'ATTEMPTED' },
      }),
    ]);
    saved.push(problemId);
  }

  revalidatePath('/dashboard');
  return { ok: true, saved };
}

/** Scores the mock from the AI evaluations of the answers just submitted. Blank answers count as 0; failed evaluations are left out and flagged. */
export async function completeMock(mockId) {
  const user = await requireUser();
  const mock = await prisma.mockAssessment.findFirst({ where: { id: String(mockId), userId: user.id } });
  if (!mock) return { ok: false, error: 'Mock not found.' };
  if (mock.status === 'COMPLETED') return { ok: true };

  const [problems, submissions, planItems] = await Promise.all([
    prisma.problem.findMany({ where: { id: { in: mock.problemIds } }, select: { id: true, title: true } }),
    prisma.submission.findMany({ where: { userId: user.id, problemId: { in: mock.problemIds }, updatedAt: { gte: mock.startedAt } }, select: { id: true, problemId: true, content: true } }),
    prisma.jobPlanItem.findMany({ where: { jobId: mock.jobId, problemId: { in: mock.problemIds } }, select: { problemId: true, skillKeys: true } }),
  ]);
  const subBy = new Map(submissions.map((s) => [s.problemId, s]));
  const titleBy = new Map(problems.map((p) => [p.id, p.title]));
  const skillsBy = new Map(planItems.map((p) => [p.problemId, p.skillKeys]));

  const questions = [];
  for (const problemId of mock.problemIds) {
    const sub = subBy.get(problemId);
    let score = 0;
    let state = 'skipped';
    if (sub) {
      const ev = await prisma.evaluation.findFirst({
        where: { submissionId: sub.id, contentHash: hashContent(sub.content) },
        orderBy: { createdAt: 'desc' },
        select: { score: true },
      });
      if (ev) {
        score = ev.score;
        state = 'scored';
      } else {
        score = null;
        state = 'no-feedback';
      }
    }
    questions.push({ problemId, title: titleBy.get(problemId) ?? 'Question', skillKeys: skillsBy.get(problemId) ?? [], score, state });
  }

  const counted = questions.filter((q) => q.score !== null);
  const partial = counted.length < questions.length;
  const score = counted.length ? Math.round(counted.reduce((a, q) => a + q.score, 0) / counted.length) : null;

  await prisma.mockAssessment.update({
    where: { id: mock.id },
    data: { status: 'COMPLETED', completedAt: new Date(), score, results: { questions, partial } },
  });

  revalidatePath(`/jobs/${mock.jobId}`);
  revalidatePath('/dashboard');
  return { ok: true };
}