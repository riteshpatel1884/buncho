const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const { topics, problems } = require('./seed-data');

const prisma = new PrismaClient();
const read = (slug, kind) => fs.readFileSync(path.join(__dirname, 'content', `${slug}.${kind}.md`), 'utf8').trim();

async function main() {
  const topicIds = {};
  for (const [order, t] of topics.entries()) {
    const row = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { name: t.name, description: t.description, order },
      create: { ...t, order },
    });
    topicIds[t.slug] = row.id;
  }

  for (const [position, p] of problems.entries()) {
    const { topic, related, allowDirectReveal = false, ...rest } = p;
    const data = { ...rest, allowDirectReveal, description: read(p.slug, 'question'), topicId: topicIds[topic], position };
    const problem = await prisma.problem.upsert({ where: { slug: p.slug }, update: data, create: data });

    const content = read(p.slug, 'solution');
    await prisma.expertSolution.upsert({
      where: { problemId: problem.id },
      update: { content },
      create: { problemId: problem.id, content },
    });
  }

  // Related links (second pass, so every problem exists)
  for (const p of problems) {
    await prisma.problem.update({
      where: { slug: p.slug },
      data: { related: { set: p.related.map((slug) => ({ slug })) } },
    });
  }

  console.log(`Seeded ${topics.length} topics and ${problems.length} problems.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
