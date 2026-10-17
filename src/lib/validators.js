import { z } from "zod";
import { DURATIONS, POLL_TYPES } from "./poll-utils";

export const createPollSchema = z
  .object({
    question: z.string().trim().min(10, "Question must be at least 10 characters").max(200),
    description: z.string().trim().max(1000).optional(),
    type: z.enum(Object.keys(POLL_TYPES)),
    options: z
      .array(z.string().trim().min(1).max(80))
      .min(2, "Add at least 2 options")
      .max(6, "Maximum 6 options")
      .refine((a) => new Set(a.map((s) => s.toLowerCase())).size === a.length, "Options must be different"),
    tags: z.array(z.string()).max(3, "Pick up to 3 tags"),
    duration: z.enum(Object.keys(DURATIONS)),
    resolutionCriteria: z.string().trim().max(500).optional(),
    resolutionSource: z.string().trim().url("Resolution source must be a valid URL").optional().or(z.literal("")),
  })
  .superRefine((v, ctx) => {
    if (v.type === "PREDICTION" && (!v.resolutionCriteria || v.resolutionCriteria.length < 10)) {
      ctx.addIssue({ code: "custom", path: ["resolutionCriteria"], message: "Predictions need clear resolution criteria (10+ characters)." });
    }
  });

export const resolvePollSchema = z.object({
  pollId: z.string().min(1),
  winningOptionId: z.string().min(1, "Choose the actual outcome"),
  evidenceNote: z.string().trim().min(10, "Explain the evidence (10+ characters)").max(500),
  evidenceUrl: z.string().trim().url("Evidence link must be a valid URL").optional().or(z.literal("")),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(60),
  bio: z.string().trim().max(280).optional(),
  isPublic: z.boolean(),
});
