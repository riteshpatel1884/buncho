const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const tags = ["AI & Tech", "Sports", "College", "Careers", "Startups", "Gaming", "Entertainment", "Finance", "Culture"];

async function main() {
  for (const name of tags) {
    const slug = name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.tag.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
}

main().finally(() => prisma.$disconnect());