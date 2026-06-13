import { analyzeJournalText, deriveWellnessSnapshot } from "@/lib/analytics/engines";
import { buildFallbackMeta } from "@/lib/ai/provider";
import { enhanceInsightAnalysis } from "@/lib/ai/service";
import type {
  AIResponseMeta,
  DemoSnapshot,
  InsightAnalysisResult,
} from "@/lib/types";

type CompatibleEnhancedInsightResult = InsightAnalysisResult &
  Partial<{
    analysis: InsightAnalysisResult;
    meta: AIResponseMeta;
  }>;

function normalizeEnhancedInsightResult(result: CompatibleEnhancedInsightResult) {
  if (result.analysis && result.meta) {
    return {
      analysis: result.analysis,
      meta: result.meta,
    };
  }

  return {
    analysis: result,
    meta: buildFallbackMeta(
      "local",
      "deterministic-fallback",
      "Insight analysis was normalized through the compatibility fallback.",
    ),
  };
}

export async function analyzeEntryWithInsightPipeline(input: {
  snapshot: DemoSnapshot;
  text: string;
  entryDate: string;
  title: string;
  reflectionPrompt: string;
  userId: string;
}) {
  const { entryDate, reflectionPrompt, snapshot, text, title, userId } = input;

  const journalEntry = analyzeJournalText(
    text,
    entryDate,
    title,
    reflectionPrompt,
    userId,
  );
  const updatedSnapshot = deriveWellnessSnapshot(
    snapshot.profile,
    [...snapshot.journalEntries, journalEntry],
    snapshot.moodLogs,
    snapshot.recoveryPlan,
  );

  const baseResult = {
    emotionVector: journalEntry.emotionVector,
    triggerMentions: journalEntry.triggerMentions,
    negativeThoughts: journalEntry.negativeThoughts,
    burnoutForecast: updatedSnapshot.burnoutForecast,
    anxietyIndicators: [
      journalEntry.anxietyIndicator >= 7 ? "high-anxiety-language" : "",
      journalEntry.stressIntensity >= 7 ? "high-stress-intensity" : "",
    ].filter(Boolean),
    motivationIndex:
      updatedSnapshot.motivationTrend.at(-1)?.smoothedScore ?? journalEntry.motivationLevel * 10,
    recommendedActions: [],
    confidence: 0.72,
    evidenceSpans: journalEntry.triggerMentions.map((trigger) => trigger.evidenceSnippet),
    safetyFlag: journalEntry.safetyFlag,
  } satisfies InsightAnalysisResult;

  const enhancedResult = normalizeEnhancedInsightResult(
    await enhanceInsightAnalysis(updatedSnapshot, journalEntry, baseResult),
  );

  return {
    entry: journalEntry,
    analysis: enhancedResult.analysis,
    meta: enhancedResult.meta,
    snapshot: updatedSnapshot,
  };
}
