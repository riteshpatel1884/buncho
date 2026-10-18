"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "../../lib/prisma";
import { getDbUser } from "..//../lib/user";
import { profileSchema } from "../../lib/validators";

export async function updateProfile(formData) {
  const user = await getDbUser();
  if (!user) return;
  const parsed = profileSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    isPublic: formData.get("isPublic") === "on",
  });
  if (!parsed.success) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, bio: parsed.data.bio || null, isPublic: parsed.data.isPublic },
  });
  revalidatePath("/profile");
}
