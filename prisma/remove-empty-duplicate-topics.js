// Removes duplicate topics that have ZERO problems (e.g. "AI Safety, Ethics and Responsible AI" with 0 questions
// next to "AI Safety, Ethics, and Responsible AI" with 36).
//
// Usage:
//   node prisma/remove-empty-duplicate-topics.js            -> dry run, only prints what it would delete
//   node prisma/remove-empty-duplicate-topics.js --apply    -> actually deletes
//
// Safety: a topic is deleted only if it has no problems at all AND another topic with the same
// name (ignoring case, commas and the word "and") exists that does have problems.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');
const normalize = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && w !== 'and').join(' ');

async function main() {
  const topics = await prisma.topic.findMany({
    include: { _count: { select: { problems: true } } },
    orderBy: { order: 'asc' },
  });

  const groups = new Map();
  for (const t of topics) {
    const key = normalize(t.name);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }

  let removed = 0;
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const keeper = list.find((t) => t._count.problems > 0);
    if (!keeper) continue; // all empty: do not guess which one to drop
    for (const t of list) {
      if (t.id === keeper.id || t._count.problems > 0) continue;
      console.log(`${APPLY ? 'Deleting' : 'Would delete'}: "${t.name}" (${t.slug}, 0 problems), keeping "${keeper.name}" (${keeper.slug}, ${keeper._count.problems} problems)`);
      if (APPLY) await prisma.topic.delete({ where: { id: t.id } });
      removed++;
    }
  }

  if (!removed) console.log('No empty duplicate topics found.');
  else if (!APPLY) console.log('\nDry run only. Re-run with --apply to delete.');
  else console.log(`\nDeleted ${removed} empty duplicate topic(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());