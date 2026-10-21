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