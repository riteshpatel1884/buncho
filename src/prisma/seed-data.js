// Metadata for the starter question bank.
// Question text lives in content/<slug>.question.md and the reference solution in content/<slug>.solution.md.
// Edit those Markdown files to curate content, then run `npx prisma db seed` again (it upserts by slug).

const ROLES = { ai: 'AI Engineer', ml: 'ML Engineer', genai: 'GenAI Engineer' };

const topics = [
  { slug: 'ml-fundamentals', name: 'Machine Learning Fundamentals', description: 'Core concepts, metrics, and model behaviour.' },
  { slug: 'deep-learning', name: 'Deep Learning', description: 'Neural networks, optimisation, and architectures.' },
  { slug: 'python-for-ai-ml', name: 'Python for AI/ML', description: 'Python language details that matter in ML code.' },
  { slug: 'statistics-and-mathematics', name: 'Statistics and Mathematics', description: 'Probability, inference, and experimentation.' },
  { slug: 'generative-ai-and-llms', name: 'Generative AI and LLMs', description: 'Transformers, prompting, and LLM behaviour.' },
  { slug: 'rag-and-vector-databases', name: 'RAG and Vector Databases', description: 'Retrieval pipelines, embeddings, and grounding.' },
  { slug: 'ai-agents-and-tool-calling', name: 'AI Agents and Tool Calling', description: 'Agent design, tools, and failure modes.' },
  { slug: 'ml-system-design', name: 'ML System Design', description: 'Designing ML systems end to end.' },
  { slug: 'production-ai-engineering', name: 'Production AI Engineering', description: 'Monitoring, drift, cost, and reliability.' },
  { slug: 'ai-engineering-case-studies', name: 'AI Engineering Case Studies', description: 'Realistic scenarios with trade-offs.' },
];

const problems = [
  {
    slug: 'bias-variance-tradeoff', title: 'Explain the bias-variance trade-off', topic: 'ml-fundamentals',
    subcategory: 'Generalisation', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 6,
    roles: [ROLES.ml, ROLES.ai], allowDirectReveal: true,
    hints: ['Think about what changes if you train on a different random sample.', 'What do learning curves look like in each failure case?'],
    related: ['precision-recall-imbalanced'],
  },
  {
    slug: 'precision-recall-imbalanced', title: 'Choosing metrics for an imbalanced fraud model', topic: 'ml-fundamentals',
    subcategory: 'Evaluation', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['What accuracy does a model that always predicts "not fraud" get?', 'Who pays the cost of a false negative versus a false positive?'],
    related: ['bias-variance-tradeoff', 'ab-test-p-value'],
  },
  {
    slug: 'vanishing-gradients', title: 'Why do gradients vanish in deep networks?', topic: 'deep-learning',
    subcategory: 'Optimisation', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Write the gradient for an early layer as a product of per-layer terms.', 'What is the maximum value of the sigmoid derivative?'],
    related: ['self-attention-explained'],
  },
  {
    slug: 'mutable-default-argument', title: 'Debug a function that remembers state between calls', topic: 'python-for-ai-ml',
    subcategory: 'Language gotchas', difficulty: 'EASY', type: 'DEBUGGING', estimatedMinutes: 5,
    roles: [ROLES.ai, ROLES.ml, ROLES.genai], allowDirectReveal: true,
    hints: ['When is a default argument expression evaluated?'],
    related: [],
  },
  {
    slug: 'self-attention-explained', title: 'Explain scaled dot-product attention', topic: 'generative-ai-and-llms',
    subcategory: 'Transformers', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 12,
    roles: [ROLES.genai, ROLES.ml],
    hints: ['What do queries, keys and values represent?', 'What happens to softmax when the inputs have a large magnitude?'],
    related: ['vanishing-gradients'],
  },
  {
    slug: 'reduce-rag-hallucinations', title: 'How would you reduce hallucinations in a RAG application?', topic: 'rag-and-vector-databases',
    subcategory: 'Reliability', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 15,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Before changing anything, how would you tell a retrieval failure from a generation failure?', 'What would you log for every request?'],
    related: ['agent-calls-wrong-tool', 'design-document-qa-system'],
  },
  {
    slug: 'agent-calls-wrong-tool', title: 'Debug an agent that keeps calling the wrong tool', topic: 'ai-agents-and-tool-calling',
    subcategory: 'Debugging agents', difficulty: 'HARD', type: 'DEBUGGING', estimatedMinutes: 20,
    roles: [ROLES.genai, ROLES.ai],
    hints: ['Read the tool descriptions as the model sees them. Are they distinguishable?', 'What does the tool return when it finds nothing?', 'Which tool here has real-world side effects?'],
    related: ['reduce-rag-hallucinations'],
  },
  {
    slug: 'design-document-qa-system', title: 'Design a question-answering system over 10 million internal documents', topic: 'ml-system-design',
    subcategory: 'Retrieval systems', difficulty: 'HARD', type: 'SYSTEM_DESIGN', estimatedMinutes: 30,
    roles: [ROLES.genai, ROLES.ml, ROLES.ai],
    hints: ['Start with requirements: latency, freshness, and who is allowed to see what.', 'Estimate the index size before choosing a vector store.'],
    related: ['reduce-rag-hallucinations', 'model-degradation-after-deployment'],
  },
  {
    slug: 'model-degradation-after-deployment', title: 'A deployed model got worse three months after launch', topic: 'production-ai-engineering',
    subcategory: 'Monitoring and drift', difficulty: 'MEDIUM', type: 'DEBUGGING', estimatedMinutes: 15,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['Rule out boring causes such as broken pipelines before assuming drift.', 'What if ground-truth labels arrive weeks late?'],
    related: ['ab-test-p-value', 'design-document-qa-system'],
  },
  {
    slug: 'ab-test-p-value', title: 'Interpret an A/B test result for a new ranking model', topic: 'statistics-and-mathematics',
    subcategory: 'Experimentation', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 10,
    roles: [ROLES.ml, ROLES.ai],
    hints: ['What exactly does a p-value condition on?', 'What happens to false positives if you check the result every day?'],
    related: ['precision-recall-imbalanced', 'model-degradation-after-deployment'],
  },
];

module.exports = { topics, problems };
