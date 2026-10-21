const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient, Prisma } = require('@prisma/client');
const { topics, problems } = require('./seed-data');

const prisma = new PrismaClient();
const file = (slug, kind) => path.join(__dirname, 'content', `${slug}.${kind}.md`);
const read = (slug, kind) => fs.readFileSync(file(slug, kind), 'utf8').trim();
const readOptional = (slug, kind) => (fs.existsSync(file(slug, kind)) ? read(slug, kind) : null);

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

  const seeded = [];
  const skipped = [];

  for (const [position, p] of problems.entries()) {
    const missing = ['question', 'solution'].filter((kind) => !fs.existsSync(file(p.slug, kind)));
    if (missing.length) {
      skipped.push(`${p.slug}: missing ${missing.map((k) => `${p.slug}.${k}.md`).join(', ')}`);
      continue;
    }

    const { topic, related, challenge, allowDirectReveal = false, ...rest } = p;
    const data = {
      ...rest,
      allowDirectReveal,
      description: read(p.slug, 'question'),
      topicId: topicIds[topic],
      position,
      // Phase 5: production challenge fields
      isChallenge: Boolean(challenge),
      steps: challenge?.steps ?? Prisma.DbNull,
      rubric: challenge?.rubric ?? Prisma.DbNull,
      scenarioData: challenge?.assets ?? Prisma.DbNull,
    };
    const problem = await prisma.problem.upsert({ where: { slug: p.slug }, update: data, create: data });

    const content = read(p.slug, 'solution');
    const alternatives = readOptional(p.slug, 'alternatives');
    await prisma.expertSolution.upsert({
      where: { problemId: problem.id },
      update: { content, alternatives },
      create: { problemId: problem.id, content, alternatives },
    });
    seeded.push(p.slug);
  }

  // Related links (second pass, so every problem exists). Links to problems that don't exist yet are ignored.
  const existing = new Set((await prisma.problem.findMany({ select: { slug: true } })).map((x) => x.slug));
  for (const p of problems.filter((x) => seeded.includes(x.slug))) {
    await prisma.problem.update({
      where: { slug: p.slug },
      data: { related: { set: p.related.filter((slug) => existing.has(slug)).map((slug) => ({ slug })) } },
    });
  }

  console.log(`Seeded ${seeded.length} of ${problems.length} problems and ${topics.length} topics.`);
  if (skipped.length) {
    console.warn('\nSkipped (add these files to prisma/content, then run the seed again):');
    skipped.forEach((s) => console.warn(`  - ${s}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());