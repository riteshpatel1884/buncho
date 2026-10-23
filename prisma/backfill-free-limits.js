// node prisma/backfill-free-limits.js
// Sets User.mockAttemptsUsed to the number of mocks each user already started, so nobody gets a fresh free attempt.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const counts = await prisma.mockAssessment.groupBy({ by: ['userId'], _count: { _all: true } });
  for (const c of counts) {
    await prisma.user.update({ where: { id: c.userId }, data: { mockAttemptsUsed: c._count._all } });
  }
  console.log(`Backfilled ${counts.length} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());