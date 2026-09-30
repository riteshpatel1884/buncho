const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const categories = [
  ["AI", "ai"],
  ["SaaS", "saas"],
  ["Developer Tools", "developer-tools"],
  ["Productivity", "productivity"],
  ["Marketing", "marketing"],
  ["Finance", "finance"],
  ["Education", "education"],
];

async function main() {
  for (const [name, slug] of categories) {
    await prisma.category.upsert({ where: { slug }, update: {}, create: { name, slug } });
  }
  console.log("Seeded categories");
}
main().finally(() => prisma.$disconnect());
