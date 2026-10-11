"use server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { emailAdmin } from "@/lib/email";
import { PROBLEM_CATEGORIES, PERSON_CATEGORIES } from "@/lib/reports";
import { cleanUsername } from "@/lib/username";

const get = (fd, k) => String(fd.get(k) || "").trim();

export async function submitReport(_prev, formData) {
  const user = await requireUser("/dashboard");

  const kind = get(formData, "kind") === "PERSON" ? "PERSON" : "PROBLEM";
  const category = get(formData, "category");
  const message = get(formData, "message");
  const cats = kind === "PERSON" ? PERSON_CATEGORIES : PROBLEM_CATEGORIES;

  if (!Object.hasOwn(cats, category)) return { error: "Choose what this is about." };
  if (message.length < 10) return { error: "Please write a little more, at least 10 characters." };
  if (message.length > 1500) return { error: "Please keep it under 1500 characters." };

  // Who is being reported: picked from a profile or request, or typed as a username.
  let target = null;
  if (kind === "PERSON") {
    const targetId = get(formData, "targetUserId");
    const username = cleanUsername(get(formData, "targetUsername"));
    if (targetId) {
      target = await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } });
    } else if (username) {
      target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
    }
    if (!target) return { error: targetId ? "We couldn't find that person." : "No one has that username. Check the spelling." };
    if (target.id === user.id) return { error: "You can't report yourself." };
  }

  // Only attach a request that belongs to this person.
  const rawBooking = get(formData, "bookingId");
  const booking = rawBooking
    ? await prisma.booking.findFirst({
        where: { id: rawBooking, OR: [{ studentId: user.id }, { expert: { userId: user.id } }] },
        select: { id: true },
      })
    : null;

  // A simple limit so the form can't be used to flood the admin.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.report.count({ where: { reporterId: user.id, createdAt: { gte: dayAgo } } });
  if (recent >= 5) return { error: "You've sent several reports today. We'll look at those first." };

  const report = await prisma.report.create({
    data: {
      reporterId: user.id,
      kind,
      category,
      message,
      targetId: target?.id ?? null,
      bookingId: booking?.id ?? null,
    },
  });

  await emailAdmin({
    subject: `New report: ${cats[category]}`,
    lines: [
      `${user.name || user.email} sent a ${kind === "PERSON" ? "report about a person" : "problem report"}.`,
      message.slice(0, 300),
    ],
    path: "/admin?status=REPORTS",
  });

  return { ok: true, ref: report.id.slice(-8) };
}