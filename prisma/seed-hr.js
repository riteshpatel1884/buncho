// HR / behavioural interview questions for AI engineering roles.
// Text lives in prisma/content/hr/<slug>.question.md and <slug>.solution.md (the expert answer).
// To add a question: add an entry below, add the two .md files, then run `npx prisma db seed`.
// The topic slug 'hr' is also listed in HR_TOPIC_SLUGS (src/lib/categories.js), which is what moves
// these questions out of /problems/ai and into /problems/hr.

const ROLES = { ai: 'AI Engineer', ml: 'ML Engineer', genai: 'GenAI Engineer' };
const ALL_ROLES = [ROLES.ai, ROLES.ml, ROLES.genai];

const topics = [
  {
    slug: 'hr',
    name: 'HR Interview Questions',
    description: 'Behavioural and HR questions for AI engineering roles, each with an expert answer.',
  },
];

const problems = [
  {
    slug: 'hr-using-ai-to-improve-daily-productivity',
    title: 'How do you work with AI to improve your daily productivity?',
    topic: 'hr', subcategory: 'AI usage and productivity', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 3,
    roles: ALL_ROLES, allowDirectReveal: true,
    hints: ['Name two or three routine tasks you hand to AI.', 'Say what you do with the time you save.'],
    related: ['hr-specific-time-you-used-ai-to-solve-a-work-challenge'],
  },
  {
    slug: 'hr-specific-time-you-used-ai-to-solve-a-work-challenge',
    title: 'Tell me about a specific time you used AI to solve a work challenge, and what exact prompt did you use?',
    topic: 'hr', subcategory: 'AI usage and productivity', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 5,
    roles: ALL_ROLES,
    hints: ['Use STAR: Situation, Task, Action, Result.', 'Quote the prompt: role, categories, output format.'],
    related: ['hr-using-ai-to-improve-daily-productivity', 'hr-caught-an-ai-tool-making-a-mistake'],
  },
  {
    slug: 'hr-what-you-bring-that-an-ai-system-cannot-replicate',
    title: 'What do you uniquely bring to this role that an AI system cannot replicate?',
    topic: 'hr', subcategory: 'Critical thinking and human value', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 4,
    roles: ALL_ROLES,
    hints: ['Credit what AI does well first.', 'Tie your human strengths to a real situation in this job.'],
    related: ['hr-keeping-your-skills-relevant-as-ai-changes-industries'],
  },
  {
    slug: 'hr-caught-an-ai-tool-making-a-mistake',
    title: 'Have you ever caught an AI tool making a mistake or giving wrong information? How did you handle it?',
    topic: 'hr', subcategory: 'Critical thinking and human value', difficulty: 'MEDIUM', type: 'PRACTICAL', estimatedMinutes: 4,
    roles: ALL_ROLES,
    hints: ['Give a real example of a hallucination.', 'Say what source you verified against and what you changed.'],
    related: ['hr-data-privacy-and-security-with-workplace-ai-tools', 'hr-specific-time-you-used-ai-to-solve-a-work-challenge'],
  },
  {
    slug: 'hr-keeping-your-skills-relevant-as-ai-changes-industries',
    title: 'With AI changing industries so rapidly, how do you keep your skills relevant?',
    topic: 'hr', subcategory: 'Adaptability and ethics', difficulty: 'EASY', type: 'CONCEPTUAL', estimatedMinutes: 3,
    roles: ALL_ROLES, allowDirectReveal: true,
    hints: ['Describe a routine: what you do and how often.', 'Cover both new tools and durable human skills.'],
    related: ['hr-what-you-bring-that-an-ai-system-cannot-replicate'],
  },
  {
    slug: 'hr-data-privacy-and-security-with-workplace-ai-tools',
    title: 'What is your personal stance on data privacy and security when interacting with workplace AI tools?',
    topic: 'hr', subcategory: 'Adaptability and ethics', difficulty: 'MEDIUM', type: 'CONCEPTUAL', estimatedMinutes: 4,
    roles: ALL_ROLES,
    hints: ['List what you never paste into a public model.', 'Mention company policy and anonymised placeholder data.'],
    related: ['hr-caught-an-ai-tool-making-a-mistake'],
  },
];

module.exports = { topics, problems };