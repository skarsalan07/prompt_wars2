import { z } from "zod";

import { EXAM_TYPES, PREPARATION_STAGES } from "@/lib/types";

export const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2).max(80),
  email: z.string().email().optional(),
  examType: z.enum(EXAM_TYPES),
  preparationStage: z.enum(PREPARATION_STAGES),
  targetExamDate: z.string().date(),
  focusSubjects: z.array(z.string().min(1).max(40)).max(5).default([]),
  mockScoreContext: z.string().max(240).optional(),
  timezone: z.string().optional(),
  demoPersona: z.string().optional(),
});

export const journalEntryInputSchema = z.object({
  title: z.string().min(2).max(120),
  reflectionPrompt: z.string().min(3).max(240),
  text: z.string().min(20).max(4000),
  entryDate: z.string().date(),
  examType: z.enum(EXAM_TYPES),
  mode: z.enum(["guest", "demo", "authenticated"]).default("guest"),
});

export const moodLogInputSchema = z.object({
  entryDate: z.string().date(),
  mood: z.number().int().min(1).max(10),
  stress: z.number().int().min(1).max(10),
  confidence: z.number().int().min(1).max(10),
  motivation: z.number().int().min(1).max(10),
  sleepHours: z.number().min(0).max(12),
  studyConsistency: z.number().int().min(0).max(100),
  goalCompletion: z.number().int().min(0).max(100),
  eventTags: z.array(z.string().min(1).max(32)).max(8).default([]),
  notes: z.string().max(240).optional(),
});

export const assistantChatSchema = z.object({
  message: z.string().min(4).max(1000),
  mode: z.enum(["guest", "demo", "authenticated"]).default("guest"),
  demoPersona: z.string().optional(),
});

export const insightAnalyzeInputSchema = journalEntryInputSchema.extend({
  demoPersona: z.string().optional(),
});

export const mergePayloadSchema = z.object({
  profile: profileSchema,
  journalEntries: z.array(z.unknown()),
  moodLogs: z.array(z.unknown()),
});

export const recoveryPlanInputSchema = z.object({
  mode: z.enum(["guest", "demo", "authenticated"]).default("guest"),
  demoPersona: z.string().optional(),
});
