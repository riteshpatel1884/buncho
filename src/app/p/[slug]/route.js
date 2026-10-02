import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordPartnerClick } from "@/lib/events";

// Counts a click on a partner link, then sends the visitor to the partner's (affiliate) URL.
export async function GET(req, { params }) {
  const { slug } = await params;
  const partner = await prisma.partner.findFirst({ where: { slug, active: true }, select: { id: true, linkUrl: true } });
  if (!partner) return NextResponse.redirect(new URL("/partners", req.url));
  await recordPartnerClick(partner);
  return NextResponse.redirect(partner.linkUrl);
}