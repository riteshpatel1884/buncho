"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { slugify, isHttpUrl, parseSkills } from "@/lib/utils";
import { STUDY_YEARS } from "@/lib/constants";

const get = (fd, k) => String(fd.get(k) || "").trim();

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
  if (college.length < 2 || branch.length < 1) return { error: "Enter your college and branch." };
  if (!STUDY_YEARS.includes(year)) return { error: "Choose your year." };
  if (targetRole.length < 2) return { error: "Enter your target role." };
  if (careerGoal.length < 5) return { error: "Tell us your career goal." };

  const data = { college, branch, year, skills, targetRole, careerGoal, problems: problems || null };
  const first = !user.role;
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name, role: "STUDENT" } }),
    prisma.studentProfile.upsert({ where: { userId: user.id }, update: data, create: { ...data, userId: user.id } }),
  ]);
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

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { name, role: "EXPERT" } }),
      prisma.expertProfile.update({ where: { userId: user.id }, data: { ...data, ...reset } }),
    ]);
    revalidatePath("/dashboard");
    revalidatePath("/experts");
    revalidatePath("/admin");
    return { ok: true, changed };
  }

  let slug = slugify(name) || "expert";
  if (await prisma.expertProfile.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name, role: "EXPERT" } }),
    prisma.expertProfile.create({ data: { ...data, slug, userId: user.id } }),
  ]);
  redirect("/dashboard?welcome=expert");
}