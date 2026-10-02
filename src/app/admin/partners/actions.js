"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import { slugify, isHttpUrl } from "@/lib/utils";
import { PARTNER_CATEGORIES } from "@/lib/partners-shared";

// Shared validation for adding and editing a partner.
function parsePartner(formData) {
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

  const startsAt = startsRaw ? new Date(`${startsRaw}T00:00:00+05:30`) : null;
  const endsAt = endsRaw ? new Date(`${endsRaw}T23:59:59+05:30`) : null;
  if (startsAt && endsAt && endsAt < startsAt) return { error: "The end date must be after the start date." };

  return {
    data: { name, category, tagline, offer: offer || null, linkUrl, logoUrl: logoUrl || null, kind, sortOrder, startsAt, endsAt },
  };
}

function refresh() {
  revalidatePath("/admin/partners");
  revalidatePath("/partners");
  revalidatePath("/dashboard");
  revalidatePath("/");
}

export async function createPartner(_prev, formData) {
  if (!(await isAdmin())) return { error: "Not allowed." };
  const parsed = parsePartner(formData);
  if (parsed.error) return parsed;

  let slug = slugify(parsed.data.name) || "partner";
  if (await prisma.partner.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  await prisma.partner.create({ data: { ...parsed.data, slug } });
  refresh();
  return { ok: true };
}

// The link /p/<slug> stays the same after an edit, so shared or printed links keep working.
export async function updatePartner(_prev, formData) {
  if (!(await isAdmin())) return { error: "Not allowed." };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Missing partner." };
  const parsed = parsePartner(formData);
  if (parsed.error) return parsed;

  const exists = await prisma.partner.findUnique({ where: { id }, select: { id: true } });
  if (!exists) return { error: "This partner no longer exists." };

  await prisma.partner.update({ where: { id }, data: parsed.data });
  refresh();
  return { ok: true };
}

export async function togglePartner(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id"));
  const partner = await prisma.partner.findUnique({ where: { id }, select: { active: true } });
  if (!partner) return;
  await prisma.partner.update({ where: { id }, data: { active: !partner.active } });
  refresh();
}

export async function deletePartner(formData) {
  if (!(await isAdmin())) return;
  await prisma.partner.delete({ where: { id: String(formData.get("id")) } });
  refresh();
}