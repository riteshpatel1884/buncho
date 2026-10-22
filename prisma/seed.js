const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient, Prisma } = require('@prisma/client');
const { topics, problems } = require('./seed-data');

const prisma = new PrismaClient();
// Files live in prisma/content/<topic-slug>/<slug>.<kind>.md
// For backward compatibility, a flat prisma/content/<slug>.<kind>.md is used if the topic folder copy does not exist.
const file = (p, kind) => {
  const inTopic = path.join(__dirname, 'content', p.topic, `${p.slug}.${kind}.md`);
  if (fs.existsSync(inTopic)) return inTopic;
  const flat = path.join(__dirname, 'content', `${p.slug}.${kind}.md`);
  return fs.existsSync(flat) ? flat : inTopic;
};
const read = (p, kind) => fs.readFileSync(file(p, kind), 'utf8').trim();
const readOptional = (p, kind) => (fs.existsSync(file(p, kind)) ? read(p, kind) : null);

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
    const missing = ['question', 'solution'].filter((kind) => !fs.existsSync(file(p, kind)));
    if (missing.length) {
      skipped.push(`${p.slug}: missing ${missing.map((k) => `content/${p.topic}/${p.slug}.${k}.md`).join(', ')}`);
      continue;
    }

    const { topic, related, challenge, allowDirectReveal = false, ...rest } = p;
    const data = {
      ...rest,
      allowDirectReveal,
      description: read(p, 'question'),
      topicId: topicIds[topic],
      position,
      // Phase 5: production challenge fields
      isChallenge: Boolean(challenge),
      steps: challenge?.steps ?? Prisma.DbNull,
      rubric: challenge?.rubric ?? Prisma.DbNull,
      scenarioData: challenge?.assets ?? Prisma.DbNull,
    };
    const problem = await prisma.problem.upsert({ where: { slug: p.slug }, update: data, create: data });

    const content = read(p, 'solution');
    const alternatives = readOptional(p, 'alternatives');
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
    console.warn('\nSkipped (add these files to prisma/content/<topic>/, then run the seed again):');
    skipped.forEach((s) => console.warn(`  - ${s}`));
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());