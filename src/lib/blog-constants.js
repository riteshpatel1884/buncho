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

// Coding notes live in the same blog pipeline; `kind: 'CODING'` keeps their categories apart from the articles.
BLOG_CATEGORIES.push(
  { slug: 'python-notes', name: 'Python', group: 'Coding Notes', kind: 'CODING', description: 'Python notes with runnable snippets: syntax, standard library, idioms and gotchas.' },
  { slug: 'data-science-code', name: 'NumPy and Pandas', group: 'Coding Notes', kind: 'CODING', description: 'Data wrangling and numerical code: arrays, dataframes, plotting and performance.' },
  { slug: 'ml-code', name: 'ML Code', group: 'Coding Notes', kind: 'CODING', description: 'Training loops, evaluation code and framework snippets for machine learning.' },
  { slug: 'javascript-notes', name: 'JavaScript and TypeScript', group: 'Coding Notes', kind: 'CODING', description: 'JavaScript and TypeScript notes: language features, async code and tooling.' },
  { slug: 'sql-notes', name: 'SQL', group: 'Coding Notes', kind: 'CODING', description: 'Queries, joins, window functions and schema design notes.' },
  { slug: 'dsa-notes', name: 'Data Structures and Algorithms', group: 'Coding Notes', kind: 'CODING', description: 'Implementations and patterns for data structures and algorithms.' },
  { slug: 'bash-notes', name: 'Linux and Bash', group: 'Coding Notes', kind: 'CODING', description: 'Shell commands, scripts and Linux tooling.' },
  { slug: 'git-notes', name: 'Git and DevOps', group: 'Coding Notes', kind: 'CODING', description: 'Git workflows, Docker and CI snippets.' },
);

export const POST_KINDS = ['BLOG', 'CODING'];
export const KIND_LABEL = { BLOG: 'Blog article', CODING: 'Coding notes' };
export const categoriesFor = (kind) => BLOG_CATEGORIES.filter((c) => (c.kind ?? 'BLOG') === kind);

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
  minCodingWords: 30, // coding notes are mostly code, so far less prose is needed
};

// These would be shadowed by the static /blog/category and /blog/feed.xml routes
export const RESERVED_SLUGS = ['category', 'tag', 'feed.xml', 'feed', 'new', 'admin'];

export const CODE_LANGUAGES = [
  ['', 'Auto-detect'],
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
  ['c', 'C'],
  ['csharp', 'C#'],
  ['php', 'PHP'],
  ['ruby', 'Ruby'],
  ['kotlin', 'Kotlin'],
  ['swift', 'Swift'],
  ['r', 'R'],
  ['graphql', 'GraphQL'],
  ['diff', 'Diff'],
  ['ini', 'INI / TOML'],
  ['makefile', 'Makefile'],
  ['python-repl', 'Python REPL'],
];

// A code block is plain code, the output it printed, or a terminal session
export const CODE_VARIANTS = { code: 'Code', output: 'Output', terminal: 'Terminal' };

export const CALLOUT_VARIANTS = {
  info: { label: 'Note' },
  tip: { label: 'Tip' },
  warning: { label: 'Warning' },
  pitfall: { label: 'Common mistake' },
};