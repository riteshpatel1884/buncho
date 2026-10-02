"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import { slugify, isHttpUrl } from "@/lib/utils";
import { PARTNER_CATEGORIES } from "@/lib/partners-shared";

export async function createPartner(_prev, formData) {
  if (!(await isAdmin())) return { error: "Not allowed." };

  const get = (k) => String(formData.get(k) || "").trim();
  const name = get("name");
  const category = get("category");
  const tagline = get("tagline");
  const offer = get("offer");
  const linkUrl = get("linkUrl");
  const logoUrl = get("logoUrl");
  const kind = get("kind") === "SPONSOR" ? "SPONSOR" : "AFFILIATE";
  const sortOrder = Number.parseInt(get("sortOrder") || "0", 10) || 0;
  const startsRaw = get("startsAt");
  const endsRaw = get("endsAt");

  if (name.length < 2 || name.length > 60) return { error: "Name must be 2 to 60 characters." };
  if (!PARTNER_CATEGORIES.includes(category)) return { error: "Choose a category." };
  if (tagline.length < 5 || tagline.length > 140) return { error: "Tagline must be 5 to 140 characters." };
  if (offer.length > 120) return { error: "Offer must be 120 characters or fewer." };
  if (!isHttpUrl(linkUrl)) return { error: "Link must start with http:// or https://" };
  if (logoUrl && !isHttpUrl(logoUrl)) return { error: "Logo must be a valid image URL." };

  let slug = slugify(name) || "partner";
  if (await prisma.partner.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  await prisma.partner.create({
    data: {
      name, slug, category, tagline, offer: offer || null, linkUrl, logoUrl: logoUrl || null, kind, sortOrder,
      startsAt: startsRaw ? new Date(`${startsRaw}T00:00:00+05:30`) : null,
      endsAt: endsRaw ? new Date(`${endsRaw}T23:59:59+05:30`) : null,
    },
  });
  revalidatePath("/admin/partners");
  revalidatePath("/partners");
  revalidatePath("/");
  return { ok: true };
}

export async function togglePartner(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id"));
  const partner = await prisma.partner.findUnique({ where: { id }, select: { active: true } });
  if (!partner) return;
  await prisma.partner.update({ where: { id }, data: { active: !partner.active } });
  revalidatePath("/admin/partners");
  revalidatePath("/partners");
  revalidatePath("/");
}

export async function deletePartner(formData) {
  if (!(await isAdmin())) return;
  await prisma.partner.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/partners");
  revalidatePath("/partners");
  revalidatePath("/");
}