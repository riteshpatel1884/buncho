import { prisma } from "./prisma";

export { PARTNER_CATEGORIES } from "./partners-shared";

// Active partners inside their date window. Partners only ever appear in their own sections.
// Nothing here touches product ranking, the Buncho Score or the Daily Pick.
export async function getActivePartners({ limit } = {}) {
  const now = new Date();
  return prisma.partner.findMany({
    where: {
      active: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
  });
}