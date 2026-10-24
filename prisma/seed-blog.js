/*
 * Optional: creates one sample published article so /blog is not empty while you try the system.
 *   node prisma/seed-blog.js
 * Uses the first admin from ADMIN_CLERK_IDS as the author (that user must have signed in once).
 * Safe to run twice: it skips if the slug already exists.
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const t = (text, marks) => ({ type: 'text', text, ...(marks && { marks }) });
const p = (...c) => ({ type: 'paragraph', content: c });
const h = (level, text) => ({ type: 'heading', attrs: { level }, content: [t(text)] });

const content = {
  type: 'doc',
  content: [
    h(2, 'What is RAG?'),
    p(t('Retrieval-Augmented Generation combines information retrieval with an LLM, so answers are grounded in external documents instead of only the model’s memory. It is the default pattern for question answering over private or fast-changing data.')),
    h(3, 'The basic pipeline'),
    p(t('A production pipeline has four stages: ingest and chunk documents, embed and index them, retrieve the most relevant chunks for each question, and generate an answer that cites those chunks. Each stage can fail independently, which is why evaluation matters.')),
    { type: 'callout', attrs: { variant: 'tip' }, content: [p(t('Evaluate retrieval and generation separately. If the right chunk is never retrieved, no prompt can fix the answer.'))] },
    h(2, 'Implementation'),
    p(t('A minimal prompt template that injects retrieved context looks like this:')),
    { type: 'codeBlock', attrs: { language: 'python' }, content: [t('from langchain_core.prompts import ChatPromptTemplate\n\nprompt = ChatPromptTemplate.from_template(\n    "Answer using only this context:\\n{context}\\n\\nQuestion: {question}"\n)')] },
    h(3, 'Chunking and retrieval'),
    p(t('Start with 300 to 500 token chunks with a small overlap, then measure recall on a labelled question set before tuning anything else. Hybrid search (keyword plus vector) with a reranker is a strong baseline for most corpora.')),
    h(2, 'Evaluation'),
    p(t('Track retrieval recall, answer faithfulness (does the answer follow the retrieved text?) and answer relevance. A small golden set of 50 to 100 real questions is enough to catch most regressions.')),
    { type: 'table', content: [
      { type: 'tableRow', content: ['Metric', 'Question it answers'].map((x) => ({ type: 'tableHeader', attrs: { colspan: 1, rowspan: 1 }, content: [p(t(x))] })) },
      { type: 'tableRow', content: ['Recall@k', 'Did we retrieve the right chunk?'].map((x) => ({ type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [p(t(x))] })) },
      { type: 'tableRow', content: ['Faithfulness', 'Is the answer supported by the context?'].map((x) => ({ type: 'tableCell', attrs: { colspan: 1, rowspan: 1 }, content: [p(t(x))] })) },
    ] },
  ],
};

const textOf = (n) => (n.type === 'text' ? n.text : (n.content ?? []).map(textOf).join(n.type === 'paragraph' || n.type === 'heading' || n.type === 'codeBlock' ? '\n' : ' '));

async function main() {
  const slug = 'building-production-ready-rag-systems';
  if (await prisma.blogPost.findUnique({ where: { slug } })) return console.log('Sample article already exists.');

  const adminId = (process.env.ADMIN_CLERK_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)[0];
  const author = adminId ? await prisma.user.findUnique({ where: { clerkId: adminId } }) : await prisma.user.findFirst();
  if (!author) throw new Error('No user found. Sign in once, then run this again.');

  await prisma.blogPost.create({
    data: {
      slug,
      title: 'Building Production-Ready RAG Systems',
      excerpt: 'A practical guide to retrieval, reranking, evaluation and production deployment of retrieval-augmented generation.',
      content,
      contentText: textOf(content),
      category: 'rag',
      tags: ['rag', 'llm', 'evaluation'],
      level: 'INTERMEDIATE',
      keyTakeaways: ['Evaluate retrieval and generation separately.', 'Hybrid search plus a reranker is a strong baseline.', 'A small golden question set catches most regressions.'],
      resources: [],
      // Replace with a real cover (the editor requires one to publish new articles)
      coverImage: 'https://placehold.co/1200x630/png',
      coverAlt: 'Diagram of a retrieval-augmented generation pipeline',
      metaDescription: 'Learn how to build production-ready RAG systems: chunking, hybrid retrieval, reranking and the evaluation metrics that actually matter.',
      status: 'PUBLISHED',
      publishedAt: new Date(),
      readingMinutes: 3,
      authorId: author.id,
    },
  });
  console.log(`Created /blog/${slug}. Open it in /admin/blog to edit.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
