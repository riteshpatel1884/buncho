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

// Competencies group topics. Weights add up to 100 and favour LLM and RAG work for AI/GenAI engineer roles.
export const COMPETENCIES = [
  { key: 'ml', name: 'ML Fundamentals', weight: 15, topics: ['ml-fundamentals', 'statistics-and-mathematics', 'python-for-ai-ml'] },
  { key: 'dl', name: 'Deep Learning', weight: 10, topics: ['deep-learning'] },
  { key: 'llm', name: 'LLM Engineering', weight: 25, topics: ['generative-ai-and-llms', 'ai-agents-and-tool-calling'] },
  { key: 'rag', name: 'RAG Systems', weight: 20, topics: ['rag-and-vector-databases'] },
  { key: 'design', name: 'AI System Design', weight: 15, topics: ['ml-system-design', 'ai-engineering-case-studies'] },
  { key: 'prod', name: 'Production Debugging', weight: 15, topics: ['production-ai-engineering'] },
];

// A competency counts in full once you have this many AI-evaluated answers in it (fewer = scaled down)
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