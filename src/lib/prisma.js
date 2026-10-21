import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// Neon pauses idle databases, and connections can drop on flaky networks. The first queries can then fail
// with P1001 ("Can't reach database server") while it wakes up, so retry those instead of crashing the page.
const TRANSIENT = new Set(['P1001', 'P1002', 'P1008', 'P1017']);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransient(err) {
  const code = err?.code ?? err?.errorCode;
  return TRANSIENT.has(code) || /can't reach database server/i.test(err?.message ?? '');
}

function createClient() {
  return new PrismaClient().$extends({
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 0; ; attempt += 1) {
          try {
            return await query(args);
          } catch (err) {
            if (attempt >= 4 || !isTransient(err)) throw err;
            await wait(800 * (attempt + 1));
          }
        }
      },
    },
  });
}

export const prisma = globalForPrisma.__prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}