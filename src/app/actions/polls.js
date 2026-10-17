"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { DURATIONS } from "@/lib/poll-utils";
import { createPollSchema, resolvePollSchema } from "@/lib/validators";

const str = (fd, k) => String(fd.get(k) ?? "");

export async function createPoll(_prev, formData) {
  const user = await getDbUser();
  if (!user) return { error: "Please sign in to create a poll." };

  const parsed = createPollSchema.safeParse({
    question: str(formData, "question"),
    description: str(formData, "description"),
    type: str(formData, "type"),
    options: formData.getAll("options").map(String).filter((o) => o.trim()),
    tags: formData.getAll("tags").map(String),
    duration: str(formData, "duration"),
    resolutionCriteria: str(formData, "resolutionCriteria"),
    resolutionSource: str(formData, "resolutionSource"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  // Basic spam guard: max 10 polls per hour per user.
  const recent = await prisma.poll.count({
    where: { authorId: user.id, createdAt: { gte: new Date(Date.now() - 3_600_000) } },
  });
  if (recent >= 10) return { error: "You're creating polls too quickly. Try again later." };

  const tags = await prisma.tag.findMany({ where: { slug: { in: d.tags } }, select: { id: true } });
  const isPrediction = d.type === "PREDICTION";

  const poll = await prisma.poll.create({
    data: {
      question: d.question,
      description: d.description || null,
      type: d.type,
      closesAt: new Date(Date.now() + DURATIONS[d.duration].ms), // computed server-side
      resolutionCriteria: isPrediction ? d.resolutionCriteria : null,
      resolutionSource: isPrediction ? d.resolutionSource || null : null,
      authorId: user.id,
      options: { create: d.options.map((text, position) => ({ text, position })) },
      tags: { connect: tags.map((t) => ({ id: t.id })) },
    },
    select: { id: true },
  });

  revalidatePath("/polls");
  revalidatePath("/");
  redirect(`/polls/${poll.id}`);
}

export async function castVote(_prev, formData) {
  const user = await getDbUser();
  if (!user) return { error: "Please sign in to vote." };

  const pollId = str(formData, "pollId");
  const optionId = str(formData, "optionId");
  if (!pollId || !optionId) return { error: "Choose an option." };

  const poll = await prisma.poll.findUnique({
    where: { id: pollId },
    select: { status: true, closesAt: true },
  });
  if (!poll) return { error: "Poll not found." };
  if (poll.status !== "OPEN" || poll.closesAt.getTime() <= Date.now()) {
    return { error: "This poll is closed." };
  }

  const option = await prisma.pollOption.findFirst({ where: { id: optionId, pollId }, select: { id: true } });
  if (!option) return { error: "Invalid option." };

  try {
    await prisma.pollVote.create({ data: { pollId, optionId, userId: user.id } });
  } catch (e) {
    if (e?.code === "P2002") return { error: "You've already voted on this poll." };
    throw e;
  }

  revalidatePath(`/polls/${pollId}`);
  revalidatePath("/polls");
  return { success: true };
}

export async function resolvePoll(_prev, formData) {
  const user = await getDbUser();
  if (!user) return { error: "Please sign in." };

  const parsed = resolvePollSchema.safeParse({
    pollId: str(formData, "pollId"),
    winningOptionId: str(formData, "winningOptionId"),
    evidenceNote: str(formData, "evidenceNote"),
    evidenceUrl: str(formData, "evidenceUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const poll = await prisma.poll.findUnique({
    where: { id: d.pollId },
    include: { options: { select: { id: true } } },
  });
  if (!poll) return { error: "Poll not found." };
  if (poll.type !== "PREDICTION") return { error: "Only predictions can be resolved." };
  if (poll.authorId !== user.id && user.role !== "ADMIN") return { error: "You can't resolve this prediction." };
  if (poll.status !== "OPEN") return { error: "This prediction is already resolved." };
  if (poll.closesAt.getTime() > Date.now()) return { error: "Voting is still open." };
  if (!poll.options.some((o) => o.id === d.winningOptionId)) return { error: "Invalid outcome." };

  try {
    await prisma.$transaction(async (tx) => {
      const upd = await tx.poll.updateMany({ where: { id: poll.id, status: "OPEN" }, data: { status: "RESOLVED" } });
      if (upd.count === 0) throw new Error("ALREADY_RESOLVED");
      await tx.pollResolution.create({
        data: {
          pollId: poll.id,
          winningOptionId: d.winningOptionId,
          evidenceNote: d.evidenceNote,
          evidenceUrl: d.evidenceUrl || null,
          resolvedById: user.id,
        },
      });
    });
  } catch (e) {
    if (e.message === "ALREADY_RESOLVED") return { error: "This prediction is already resolved." };
    throw e;
  }

  revalidatePath(`/polls/${poll.id}`);
  revalidatePath("/polls");
  return { success: true };
}