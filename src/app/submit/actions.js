"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { slugify, isHttpUrl } from "@/lib/utils";

export async function submitProduct(_prev, formData) {
  const user = await getOrCreateUser();
  if (!user) return { error: "Please sign in first." };

  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const websiteUrl = String(formData.get("websiteUrl") || "").trim();
  const logoUrl = String(formData.get("logoUrl") || "").trim();
  const pricing = String(formData.get("pricing") || "").trim();
  const categoryId = String(formData.get("categoryId") || "");
  const screenshots = String(formData.get("screenshots") || "")
    .split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 5);

  if (name.length < 2 || name.length > 60) return { error: "Name must be 2 to 60 characters." };
  if (tagline.length < 5 || tagline.length > 100) return { error: "Tagline must be 5 to 100 characters." };
  if (description.length < 30 || description.length > 3000) return { error: "Description must be 30 to 3000 characters." };
  if (!isHttpUrl(websiteUrl)) return { error: "Website must start with http:// or https://" };
  if (logoUrl && !isHttpUrl(logoUrl)) return { error: "Logo must be a valid image URL." };
  if (screenshots.some((s) => !isHttpUrl(s))) return { error: "Each screenshot must be a valid URL." };

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Choose a category." };

  const pending = await prisma.product.count({ where: { userId: user.id, status: "PENDING" } });
  if (pending >= 3) return { error: "You have 3 products waiting for review. Wait for approval before adding more." };

  let slug = slugify(name) || "product";
  if (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await prisma.product.create({
    data: { name, slug, tagline, description, websiteUrl, logoUrl: logoUrl || null, pricing: pricing || null,
      screenshots, categoryId, userId: user.id },
  });

  redirect("/dashboard?submitted=1");
}
