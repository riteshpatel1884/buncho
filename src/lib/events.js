import { prisma } from "./prisma";
import { getDbUser } from "./user";
import { getVisitor } from "./visitor";

const DEDUPE_MS = 30 * 60 * 1000;

// Records a VIEW or CLICK. Skips bots, the product's own founder, and repeat events from the
// same visitor within 30 minutes, so the numbers behind the Buncho Score stay honest.
export async function recordEvent(product, type) {
  const [{ hash, isBot }, user] = await Promise.all([getVisitor(), getDbUser()]);
  if (isBot) return;
  if (user && user.id === product.userId) return;

  const duplicate = await prisma.productEvent.findFirst({
    where: { productId: product.id, type, visitorHash: hash, createdAt: { gte: new Date(Date.now() - DEDUPE_MS) } },
    select: { id: true },
  });
  if (duplicate) return;

  await prisma.productEvent.create({ data: { productId: product.id, type, visitorHash: hash } });
}