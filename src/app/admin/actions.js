"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";

const refresh = () => {
  revalidatePath("/admin");
  revalidatePath("/experts");
};

export async function setExpertStatus(formData) {
  if (!(await isAdmin())) return;
  const status = String(formData.get("status"));
  if (!["PENDING", "ACTIVE", "SUSPENDED"].includes(status)) return;
  // Approving counts as a review, so it also clears any "changed details" marks.
  const data = status === "ACTIVE" ? { status, needsReview: false, unverifiedFields: [] } : { status };
  await prisma.expertProfile.update({ where: { id: String(formData.get("id")) }, data });
  refresh();
}

// Admin has checked the changed details. Clears the "Not verified" marks and the review flag.
export async function markReviewed(formData) {
  if (!(await isAdmin())) return;
  await prisma.expertProfile.update({
    where: { id: String(formData.get("id")) },
    data: { needsReview: false, unverifiedFields: [] },
  });
  refresh();
}

// field is "educationVerified" or "employmentVerified". Verification means Buncho actually checked the claim.
export async function toggleVerification(formData) {
  if (!(await isAdmin())) return;
  const field = String(formData.get("field"));
  if (!["educationVerified", "employmentVerified"].includes(field)) return;
  const id = String(formData.get("id"));
  const expert = await prisma.expertProfile.findUnique({ where: { id }, select: { [field]: true } });
  if (!expert) return;
  await prisma.expertProfile.update({ where: { id }, data: { [field]: !expert[field] } });
  refresh();
}