import { z } from "zod";

export const aiInsightEnhancementSchema = z.object({
  insightSummary: z.string().min(20).max(400),
  recommendedActions: z.array(z.string().min(10).max(180)).min(3).max(4),
  coachAngle: z.string().min(20).max(220),
  motivationalMessage: z.string().min(20).max(220),
  caution: z.string().min(10).max(180),
});

export const aiCoachResponseSchema = z.object({
  reply: z.string().min(30).max(800),
  recommendedExercises: z.array(z.string().min(8).max(180)).min(2).max(4),
  suggestedPrompts: z.array(z.string().min(8).max(160)).min(2).max(4),
});

export type AIInsightEnhancement = z.infer<typeof aiInsightEnhancementSchema>;
export type AICoachOutput = z.infer<typeof aiCoachResponseSchema>;
