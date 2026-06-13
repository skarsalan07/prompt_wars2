import { buildCoachResponse } from "@/lib/analytics/engines";
import { aiCoachResponseSchema, aiInsightEnhancementSchema } from "@/lib/ai/schemas";
import { buildAnalysisPrompt, buildCoachPrompt } from "@/lib/ai/prompts";
import { GeminiAdapter } from "@/lib/ai/gemini";
import { GroqAdapter } from "@/lib/ai/groq";
import type {
  AIResponseMeta,
  CoachResponse,
  DemoSnapshot,
  InsightAnalysisResult,
  JournalEntry,
} from "@/lib/types";

export type EnhancedInsightAnalysisResult = InsightAnalysisResult & {
  analysis: InsightAnalysisResult;
  meta: AIResponseMeta;
};

function wrapInsightAnalysis(
  analysis: InsightAnalysisResult,
  meta: AIResponseMeta,
): EnhancedInsightAnalysisResult {
  return {
    ...analysis,
    analysis,
    meta,
  };
}

function getAdapter() {
  return (process.env.AI_PROVIDER ?? "groq") === "gemini"
    ? new GeminiAdapter()
    : new GroqAdapter();
}

export async function enhanceInsightAnalysis(
  snapshot: DemoSnapshot,
  journalEntry: JournalEntry,
  baseResult: InsightAnalysisResult,
): Promise<EnhancedInsightAnalysisResult> {
  const fallback = {
    insightSummary:
      `${snapshot.profile.name.split(" ")[0]} is showing pressure around ${snapshot.topTriggers[0]?.canonicalLabel ?? "motivation stability"} ` +
      `with a ${snapshot.burnoutForecast.currentRiskBand} burnout trend.`,
    recommendedActions: [
      "Protect a short pre-study breathing reset before your hardest subject.",
      "Shift one overloaded session into a focused confidence-rebuild sprint.",
      "Log one proof of progress tonight before ending study.",
    ],
    coachAngle: "Validate effort first, then connect action steps to the current exam stage.",
    motivationalMessage: "You do not need a perfect day to create real momentum today.",
    caution: "Avoid generic productivity pressure that ignores exam-specific emotional load.",
  };

  const adapter = getAdapter();
  const { output, meta } = await adapter.generateJson({
    schemaName: "AIInsightEnhancement",
    prompt: buildAnalysisPrompt({
      profile: snapshot.profile,
      journalEntry,
      topTriggers: snapshot.topTriggers,
      burnoutForecast: snapshot.burnoutForecast,
      memoryNote: snapshot.memorySummary.noteForCoach,
    }),
    fallback,
  });

  const parsed = aiInsightEnhancementSchema.safeParse(output);
  const normalized = parsed.success ? parsed.data : fallback;

  return wrapInsightAnalysis(
    {
      ...baseResult,
      recommendedActions: normalized.recommendedActions,
      evidenceSpans: journalEntry.triggerMentions.map((trigger) => trigger.evidenceSnippet),
      confidence: Math.max(baseResult.confidence, 0.74),
    } satisfies InsightAnalysisResult,
    meta,
  );
}

export async function generateCoachReply(
  snapshot: DemoSnapshot,
  message: string,
): Promise<CoachResponse> {
  const fallback = buildCoachResponse(snapshot, message);
  const adapter = getAdapter();
  const { output, meta } = await adapter.generateJson({
    schemaName: "AICoachOutput",
    prompt: buildCoachPrompt({
      profile: snapshot.profile,
      topTriggers: snapshot.topTriggers,
      burnoutForecast: snapshot.burnoutForecast,
      memoryNote: snapshot.memorySummary.noteForCoach,
      message,
    }),
    fallback,
  });
  const parsed = aiCoachResponseSchema.safeParse(output);
  const normalized = parsed.success ? parsed.data : fallback;
  const fallbackMeta = fallback.meta as AIResponseMeta;

  return {
    reply: normalized.reply,
    recommendedExercises: normalized.recommendedExercises,
    suggestedPrompts: normalized.suggestedPrompts,
    safetyFlag: fallback.safetyFlag,
    meta: meta.usedLiveModel ? meta : fallbackMeta ?? meta,
  };
}
