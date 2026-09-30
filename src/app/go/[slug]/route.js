import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tracks an outbound click, then redirects to the product website.
export async function GET(_req, { params }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: "APPROVED" },
    select: { id: true, websiteUrl: true },
  });
  if (!product) return NextResponse.redirect(new URL("/", _req.url));

  await prisma.productEvent.create({ data: { type: "CLICK", productId: product.id } });
  return NextResponse.redirect(product.websiteUrl);
}
