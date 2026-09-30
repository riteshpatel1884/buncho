import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export async function POST(req) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Sign in to vote" }, { status: 401 });

  const { productId } = await req.json().catch(() => ({}));
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const product = await prisma.product.findFirst({
    where: { id: productId, status: "APPROVED" },
    select: { id: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const key = { userId_productId: { userId: user.id, productId } };
  const existing = await prisma.vote.findUnique({ where: key });

  try {
    if (existing) await prisma.vote.delete({ where: key });
    else await prisma.vote.create({ data: { userId: user.id, productId } });
  } catch {
    // double-click race: unique constraint already protects data integrity
  }

  const count = await prisma.vote.count({ where: { productId } });
  const voted = !!(await prisma.vote.findUnique({ where: key }));
  return NextResponse.json({ voted, count });
}
