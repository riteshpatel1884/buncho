export const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'];
export const PROBLEM_TYPES = ['CONCEPTUAL', 'PRACTICAL', 'DEBUGGING', 'SYSTEM_DESIGN', 'CASE_STUDY'];

export const DIFFICULTY_LABEL = { EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' };

export const TYPE_LABEL = {
  CONCEPTUAL: 'Conceptual',
  PRACTICAL: 'Practical exercise',
  DEBUGGING: 'Debugging',
  SYSTEM_DESIGN: 'System design',
  CASE_STUDY: 'Case study',
};

export const MIN_ANSWER_LENGTH = 20;
export const MAX_ANSWER_LENGTH = 12000;
export const PAGE_SIZE = 20;

/* ---------- Phase 3: community ---------- */

export const REPORT_REASONS = ['INCORRECT', 'COPIED', 'INAPPROPRIATE', 'SPAM', 'OTHER'];

export const REPORT_REASON_LABEL = {
  INCORRECT: 'Technically incorrect',
  COPIED: 'Copied from another source',
  INAPPROPRIATE: 'Inappropriate or abusive',
  SPAM: 'Spam or off-topic',
  OTHER: 'Something else',
};

// An answer is hidden automatically once this many different users have an open report on it.
export const REPORT_AUTOHIDE_THRESHOLD = 3;
export const MAX_COMMENT_LENGTH = 1000;
export const MAX_REPORT_DETAILS = 500;
export const COMMUNITY_PAGE_SIZE = 10;


/* ---------- Phase 4: AI feedback ---------- */

export const AI_EVAL_LIMIT_PER_HOUR = 10;
export const AI_EVAL_LIMIT_PER_DAY = 30;

// Max points per rubric dimension. The total is 100.
export const AI_RUBRIC = { coverage: 40, accuracy: 30, reasoning: 20, clarity: 10 };
export const AI_RUBRIC_LABEL = {
  coverage: 'Coverage',
  accuracy: 'Technical accuracy',
  reasoning: 'Reasoning depth',
  clarity: 'Clarity',
};

/* ---------- Phase 6: readiness ---------- */

// One entry per topic, in the order shown on the dashboard. Weights add up to 100 and favour LLM and RAG work
// for AI/GenAI engineer roles. A topic with no published questions is left out of the score until it has some.
export const COMPETENCIES = [
  { key: 'ml', name: 'Machine Learning Fundamentals', weight: 8, topics: ['ml-fundamentals'] },
  { key: 'dl', name: 'Deep Learning', weight: 10, topics: ['deep-learning'] },
  { key: 'python', name: 'Python for AI/ML', weight: 4, topics: ['python-for-ai-ml'] },
  { key: 'stats', name: 'Statistics and Mathematics', weight: 3, topics: ['statistics-and-mathematics'] },
  { key: 'genai', name: 'Generative AI and LLMs', weight: 15, topics: ['generative-ai-and-llms'] },
  { key: 'rag', name: 'RAG and Vector Databases', weight: 20, topics: ['rag-and-vector-databases'] },
  { key: 'agents', name: 'AI Agents and Tool Calling', weight: 10, topics: ['ai-agents-and-tool-calling'] },
  { key: 'design', name: 'ML System Design', weight: 8, topics: ['ml-system-design'] },
  { key: 'prod', name: 'Production AI Engineering', weight: 15, topics: ['production-ai-engineering'] },
  { key: 'cases', name: 'AI Engineering Case Studies', weight: 7, topics: ['ai-engineering-case-studies'] },
];

// A topic counts in full once you have this many AI-evaluated answers in it (fewer = scaled down)
export const READINESS_FULL_CONFIDENCE = 3;
// Below this many evaluated answers overall, the score is labelled an early estimate
export const READINESS_PROVISIONAL_BELOW = 8;
// A topic average under this is treated as a weak area
export const WEAK_BELOW = 65;
// Spaced revision: [score below, days until the answer is due for revision again]
export const REVISION_INTERVAL_DAYS = [
  [50, 2],
  [70, 5],
  [85, 10],
  [101, 21],
];

/* ---------- Phase 7: job description preparation ---------- */

export const JD_MIN_LENGTH = 120;
export const JD_MAX_LENGTH = 8000;
export const MAX_JOB_TARGETS = 10;
export const MIN_SKILLS_REQUIRED = 2; // fewer matched skills means the text is probably not an AI/ML job description

// Practice plan size and how many questions one skill may take
export const PLAN_SIZE = 16;
export const PLAN_MAX_PER_SKILL = 5;
// A question must reach this relevance to count as covering a skill (see lib/jobs/plan.js)
export const RELEVANCE_THRESHOLD = 3;

// Mock assessment
export const MOCK_QUESTIONS = 5;
export const MOCK_MIN_QUESTIONS = 3;
export const MOCK_MIN_MINUTES = 20;
export const MOCK_MAX_MINUTES = 60;