import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordEvent } from "@/lib/events";

// Counts an outbound click (bots, the founder and repeat clicks are ignored), then redirects.
export async function GET(req, { params }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: "APPROVED" },
    select: { id: true, userId: true, websiteUrl: true },
  });
  if (!product) return NextResponse.redirect(new URL("/", req.url));

  await recordEvent(product, "CLICK");
  return NextResponse.redirect(product.websiteUrl);
}