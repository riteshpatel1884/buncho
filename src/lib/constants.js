export const IST = "Asia/Kolkata";

export const SERVICE_TYPES = {
  RESUME_REVIEW: "Resume review",
  MOCK_INTERVIEW: "Mock interview",
  CAREER_GUIDANCE: "Career guidance",
  PROJECT_REVIEW: "Project review",
  OTHER: "Other",
};

export const SERVICE_BLURBS = {
  RESUME_REVIEW: "Get your resume checked by someone who has been shortlisted.",
  MOCK_INTERVIEW: "Practise with a real interview, then get honest feedback.",
  CAREER_GUIDANCE: "Talk through your path with someone a few steps ahead.",
  PROJECT_REVIEW: "Have your projects and GitHub reviewed before recruiters do.",
  OTHER: "Other help from people who have done it.",
};

export const STUDY_YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Graduated"];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const DURATIONS = [15, 30, 45, 60, 90];

export const inr = (n) => `₹${new Intl.NumberFormat("en-IN").format(n)}`;

export const fmtDateTime = (d) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(d));

// 1140 -> "7:00 PM"
export function fmtMinutes(m) {
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, "0");
  return `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
}

// "19:30" -> 1170
export function timeToMinutes(value) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(value || ""));
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  return h > 23 || min > 59 ? null : h * 60 + min;
}
