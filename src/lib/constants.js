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