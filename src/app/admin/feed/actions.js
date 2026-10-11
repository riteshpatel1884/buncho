"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";

const refresh = () => {
  revalidatePath("/admin/feed");
  revalidatePath("/feed");
};

// Deletes any post, together with its replies, likes and saves.
export async function adminDeletePost(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.$transaction([
    prisma.postComment.deleteMany({ where: { postId: id } }),
    prisma.postLike.deleteMany({ where: { postId: id } }),
    prisma.postSave.deleteMany({ where: { postId: id } }),
    prisma.post.deleteMany({ where: { id } }),
  ]);
  refresh();
}

// Deletes a single reply (comment) on any post.
export async function adminDeleteComment(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.postComment.deleteMany({ where: { id } });
  refresh();
}