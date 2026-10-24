/* Blog-wide constants. Safe to import from server and client code. */

// `group` feeds the small kicker above the article title: "AI ENGINEERING / GENERATIVE AI".
export const BLOG_CATEGORIES = [
  { slug: 'generative-ai', name: 'Generative AI', group: 'AI Engineering', description: 'Building with foundation models: prompting, agents, evaluation and shipping GenAI products.' },
  { slug: 'llms', name: 'LLMs', group: 'AI Engineering', description: 'How large language models work, from tokenization and attention to inference and fine-tuning.' },
  { slug: 'rag', name: 'RAG', group: 'AI Engineering', description: 'Retrieval-augmented generation: chunking, embeddings, hybrid search, reranking and evaluation.' },
  { slug: 'ai-agents', name: 'AI Agents', group: 'AI Engineering', description: 'Tool use, planning, memory and reliability for LLM-powered agents.' },
  { slug: 'machine-learning', name: 'Machine Learning', group: 'Machine Learning', description: 'Core ML concepts, model evaluation and practical modelling techniques.' },
  { slug: 'deep-learning', name: 'Deep Learning', group: 'Machine Learning', description: 'Neural network architectures, training dynamics and optimisation.' },
  { slug: 'mlops', name: 'MLOps', group: 'Machine Learning', description: 'Deploying, monitoring and operating ML and LLM systems in production.' },
  { slug: 'ai-careers', name: 'AI Careers', group: 'Career', description: 'Interview preparation, skills and career paths for AI and ML engineers.' },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.slug, c]));

export const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
export const LEVEL_LABEL = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' };
// Same colour tokens the problem difficulty badges use
export const LEVEL_STYLE = {
  BEGINNER: 'bg-easy/12 text-easy',
  INTERMEDIATE: 'bg-medium/12 text-medium',
  ADVANCED: 'bg-hard/12 text-hard',
};

export const POST_STATUSES = ['DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'SCHEDULED'];
export const STATUS_LABEL = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  UNPUBLISHED: 'Unpublished',
  SCHEDULED: 'Scheduled',
};

export const RESOURCE_TYPES = ['github', 'notebook', 'dataset', 'docs', 'other'];
export const RESOURCE_LABEL = {
  github: 'GitHub repository',
  notebook: 'Notebook',
  dataset: 'Dataset',
  docs: 'Documentation',
  other: 'Link',
};

export const BLOG_PAGE_SIZE = 9;
export const MAX_COMMENT_LENGTH = 2000;
export const COMMENTS_PER_HOUR = 5;

export const LIMITS = {
  title: 120,
  titleMin: 8,
  excerptMin: 50,
  excerptMax: 300,
  metaMin: 70,
  metaMax: 160,
  seoTitleMax: 60,
  slugMax: 80,
  tagsMax: 8,
  takeawaysMax: 6,
  resourcesMax: 8,
  minWords: 150,
};

// These would be shadowed by the static /blog/category and /blog/feed.xml routes
export const RESERVED_SLUGS = ['category', 'tag', 'feed.xml', 'feed', 'new', 'admin'];

export const CODE_LANGUAGES = [
  ['plaintext', 'Plain text'],
  ['python', 'Python'],
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['bash', 'Bash'],
  ['json', 'JSON'],
  ['yaml', 'YAML'],
  ['sql', 'SQL'],
  ['dockerfile', 'Dockerfile'],
  ['markdown', 'Markdown'],
  ['css', 'CSS'],
  ['xml', 'HTML / XML'],
  ['cpp', 'C++'],
  ['java', 'Java'],
  ['go', 'Go'],
  ['rust', 'Rust'],
];

export const CALLOUT_VARIANTS = {
  info: { label: 'Note' },
  tip: { label: 'Tip' },
  warning: { label: 'Warning' },
};
