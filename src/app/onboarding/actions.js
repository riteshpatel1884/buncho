"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin, adminCodeMatches } from "@/lib/user";
import { slugify, isHttpUrl, parseSkills } from "@/lib/utils";
import { STUDY_YEARS } from "@/lib/constants";
import { cleanUsername, usernameError } from "@/lib/username";

const get = (fd, k) => String(fd.get(k) || "").trim();
const usernameTaken = (e) => e?.code === "P2002" && String(e.meta?.target ?? "").includes("username");
const TAKEN = "That username is taken. Try another.";

// Checks the username format and that nobody else has it.
async function checkUsername(formData, userId) {
  const username = cleanUsername(get(formData, "username"));
  const bad = usernameError(username);
  if (bad) return { error: bad };
  const other = await prisma.user.findFirst({ where: { username, NOT: { id: userId } }, select: { id: true } });
  if (other) return { error: TAKEN };
  return { username };
}

export async function saveStudentProfile(_prev, formData) {
  const user = await requireUser("/onboarding");
  if (user.role === "EXPERT") return { error: "This is an expert account." };

  const name = get(formData, "name");
  const college = get(formData, "college");
  const branch = get(formData, "branch");
  const year = get(formData, "year");
  const targetRole = get(formData, "targetRole");
  const careerGoal = get(formData, "careerGoal");
  const problems = get(formData, "problems");
  const skills = parseSkills(get(formData, "skills"));

  if (name.length < 2) return { error: "Enter your name." };
  const u = await checkUsername(formData, user.id);
  if (u.error) return { error: u.error };
  if (college.length < 2 || branch.length < 1) return { error: "Enter your college and branch." };
  if (!STUDY_YEARS.includes(year)) return { error: "Choose your year." };
  if (targetRole.length < 2) return { error: "Enter your target role." };
  if (careerGoal.length < 5) return { error: "Tell us your career goal." };

  const data = { college, branch, year, skills, targetRole, careerGoal, problems: problems || null };
  const first = !user.role;
  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name, role: "STUDENT", username: u.username } }),
      prisma.studentProfile.upsert({ where: { userId: user.id }, update: data, create: { ...data, userId: user.id } }),
    ]);
  } catch (e) {
    if (usernameTaken(e)) return { error: TAKEN };
    throw e;
  }
  revalidatePath("/dashboard");
  if (first) redirect("/experts?welcome=1");
  return { ok: true };
}

export async function saveExpertProfile(_prev, formData) {
  const user = await requireUser("/onboarding/expert");
  if (user.role === "STUDENT") return { error: "This is a student account." };

  const name = get(formData, "name");
  const headline = get(formData, "headline");
  const college = get(formData, "college");
  const branch = get(formData, "branch");
  const graduationYear = Number.parseInt(get(formData, "graduationYear"), 10);
  const company = get(formData, "company");
  const jobTitle = get(formData, "jobTitle");
  const experienceYears = Number.parseInt(get(formData, "experienceYears"), 10);
  const bio = get(formData, "bio");
  const linkedinUrl = get(formData, "linkedinUrl");
  const githubUrl = get(formData, "githubUrl");
  const skills = parseSkills(get(formData, "skills"));

  if (name.length < 2) return { error: "Enter your name." };
  const u = await checkUsername(formData, user.id);
  if (u.error) return { error: u.error };
  if (college.length < 2 || branch.length < 1) return { error: "Enter your college and branch." };
  if (!(graduationYear >= 1990 && graduationYear <= 2035)) return { error: "Enter a valid graduation year." };
  if (company.length < 1 || jobTitle.length < 2) return { error: "Enter your current role and company." };
  if (!(experienceYears >= 0 && experienceYears <= 40)) return { error: "Enter your years of experience." };
  if (bio.length < 40) return { error: "Tell students a bit more about you (at least 40 characters)." };
  if (!isHttpUrl(linkedinUrl)) return { error: "Enter your LinkedIn link, starting with https://" };
  if (githubUrl && !isHttpUrl(githubUrl)) return { error: "GitHub link must start with https://" };

  const data = {
    headline: headline || null, college, branch, graduationYear, company, jobTitle, experienceYears,
    skills, bio, linkedinUrl, githubUrl: githubUrl || null,
  };

  const existing = await prisma.expertProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true, college: true, branch: true, graduationYear: true, company: true,
      jobTitle: true, linkedinUrl: true, githubUrl: true, unverifiedFields: true,
    },
  });

  if (existing) {
    const norm = (s) => String(s ?? "").trim().toLowerCase().replace(/\/+$/, "");
    const same = (a, b) => norm(a) === norm(b);

    const changed = [];
    if (!same(existing.college, college) || !same(existing.branch, branch) || existing.graduationYear !== graduationYear) changed.push("college");
    if (!same(existing.jobTitle, jobTitle)) changed.push("role");
    if (!same(existing.company, company)) changed.push("company");
    if (!same(existing.linkedinUrl, linkedinUrl)) changed.push("linkedin");
    if (!same(existing.githubUrl, githubUrl)) changed.push("github");

    // Verification means Buncho checked the old details. Changed details lose the badge and wait for a re-check.
    const reset = changed.length
      ? {
          ...(changed.some((f) => f === "college" || f === "linkedin") ? { educationVerified: false } : {}),
          ...(changed.some((f) => f === "role" || f === "company" || f === "linkedin") ? { employmentVerified: false } : {}),
          unverifiedFields: [...new Set([...existing.unverifiedFields, ...changed])],
          needsReview: true,
        }
      : {};

    try {
      await prisma.$transaction([
        prisma.user.update({ where: { id: user.id }, data: { name, role: "EXPERT", username: u.username } }),
        prisma.expertProfile.update({ where: { userId: user.id }, data: { ...data, ...reset } }),
      ]);
    } catch (e) {
      if (usernameTaken(e)) return { error: TAKEN };
      throw e;
    }
    revalidatePath("/dashboard");
    revalidatePath("/experts");
    revalidatePath("/admin");
    return { ok: true, changed };
  }

  let slug = slugify(name) || "expert";
  if (await prisma.expertProfile.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name, role: "EXPERT", username: u.username } }),
      prisma.expertProfile.create({ data: { ...data, slug, userId: user.id } }),
    ]);
  } catch (e) {
    if (usernameTaken(e)) return { error: TAKEN };
    throw e;
  }
  redirect("/dashboard?welcome=expert");
}

// ---------------------------------------------------------------------------
// Admin registration
// ---------------------------------------------------------------------------

// Slows down code guessing: 5 wrong tries per account every 15 minutes.
// This lives in server memory, so on serverless hosting it is best-effort; add a shared store (Redis/DB) if you need a hard limit.
const tries = new Map();
const MAX_TRIES = 5;
const WINDOW_MS = 15 * 60 * 1000;

function tooManyTries(key) {
  const now = Date.now();
  const recent = (tries.get(key) || []).filter((t) => now - t < WINDOW_MS);
  tries.set(key, recent);
  return recent.length >= MAX_TRIES;
}

// Step 1: the person enters the admin code. A match makes the account an admin and opens the details form.
export async function verifyAdminCode(_prev, formData) {
  const user = await requireUser("/onboarding/admin");
  if (user.role) return { error: "This account is already registered as a student or expert, so it can't become an admin." };
  if (await isAdmin()) redirect("/onboarding/admin/profile");

  if (tooManyTries(user.id)) return { error: "Too many wrong codes. Please wait 15 minutes and try again." };

  if (!process.env.ADMIN_REGISTRATION_CODE) return { error: "Admin registration is not set up on this server." };

  if (!adminCodeMatches(get(formData, "code"))) {
    tries.set(user.id, [...(tries.get(user.id) || []), Date.now()]);
    return { error: "That code is not correct, so this account can't be an admin." };
  }

  tries.delete(user.id);
  await prisma.user.update({ where: { id: user.id }, data: { isAdmin: true } });
  revalidatePath("/admin");
  redirect("/onboarding/admin/profile");
}

// Step 2: every field is optional. Empty fields are simply left as they are.
export async function saveAdminProfile(_prev, formData) {
  const user = await requireUser("/onboarding/admin");
  if (!(await isAdmin())) return { error: "Enter the admin code first." };

  const name = get(formData, "name");
  const headline = get(formData, "headline");
  const about = get(formData, "about");
  const contactInfo = get(formData, "contactInfo");

  if (name && name.length < 2) return { error: "Name must be at least 2 characters." };

  const userData = {};
  if (name) userData.name = name;
  if (get(formData, "username")) {
    const u = await checkUsername(formData, user.id);
    if (u.error) return { error: u.error };
    userData.username = u.username;
  }

  const profile = { headline: headline || null, about: about || null, contactInfo: contactInfo || null };
  try {
    await prisma.$transaction([
      ...(Object.keys(userData).length ? [prisma.user.update({ where: { id: user.id }, data: userData })] : []),
      prisma.adminProfile.upsert({ where: { userId: user.id }, update: profile, create: { ...profile, userId: user.id } }),
    ]);
  } catch (e) {
    if (usernameTaken(e)) return { error: TAKEN };
    throw e;
  }
  revalidatePath("/admin");
  redirect("/admin");
}