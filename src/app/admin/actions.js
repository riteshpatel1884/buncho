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
  await prisma.expertProfile.update({ where: { id: String(formData.get("id")) }, data: { status } });
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
