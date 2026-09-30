"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function addComment(formData) {
  const user = await getOrCreateUser();
  if (!user) return;
  const productId = String(formData.get("productId") || "");
  const slug = String(formData.get("slug") || "");
  const body = String(formData.get("body") || "").trim().slice(0, 1000);
  if (!body || !productId) return;

  const product = await prisma.product.findFirst({ where: { id: productId, status: "APPROVED" }, select: { id: true } });
  if (!product) return;

  await prisma.comment.create({ data: { body, productId, userId: user.id } });
  revalidatePath(`/products/${slug}`);
}
