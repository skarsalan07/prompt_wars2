import { NextRequest } from "next/server";

import { guardApiRequest } from "@/lib/api";
import { analyzeEntryWithInsightPipeline } from "@/lib/ai/entry-analysis";
import { loadSnapshot } from "@/lib/data";
import { buildGuestSnapshot } from "@/lib/guest";
import { detectPromptInjection, sanitizePromptInput } from "@/lib/security/prompt-guard";
import { jsonError, jsonOk } from "@/lib/security/response";
import type { InsightAnalyzeResponse } from "@/lib/types";
import { insightAnalyzeInputSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const { session } = await guardApiRequest(request);
    const payload = insightAnalyzeInputSchema.parse(await request.json());
    const cleanedText = sanitizePromptInput(payload.text);

    if (detectPromptInjection(cleanedText)) {
      return jsonError("Journal text contained prompt-injection-like instructions and was rejected.", 400);
    }

    const snapshot =
      (await loadSnapshot({
        userId: session?.user?.id,
        demoPersona:
          payload.demoPersona ?? request.nextUrl.searchParams.get("demoPersona"),
      })) ?? buildGuestSnapshot(payload.examType);
    const { analysis, meta } = await analyzeEntryWithInsightPipeline({
      snapshot,
      text: cleanedText,
      entryDate: payload.entryDate,
      title: payload.title,
      reflectionPrompt: payload.reflectionPrompt,
      userId: session?.user?.id ?? "guest-user",
    });

    const response = {
      emotionVector: analysis.emotionVector,
      stressTriggers: analysis.triggerMentions.map((trigger) => ({
        label: trigger.canonicalLabel,
        category: trigger.category,
        severity: trigger.severity,
        confidence: trigger.confidence,
        evidenceSnippet: trigger.evidenceSnippet,
        source: trigger.source,
        entryDate: trigger.entryDate,
      })),
      burnoutRisk: {
        level: analysis.burnoutForecast.currentRiskBand,
        score: analysis.burnoutForecast.currentScore,
        forecast7d: analysis.burnoutForecast.forecast7d,
        forecast30d: analysis.burnoutForecast.forecast30d,
        reasonFactors: analysis.burnoutForecast.reasonFactors,
      },
      anxietyIndicators: analysis.anxietyIndicators,
      motivationIndex: analysis.motivationIndex,
      recommendedActions: analysis.recommendedActions,
      confidence: analysis.confidence,
      evidenceSpans: analysis.evidenceSpans,
      safetyFlag: analysis.safetyFlag,
      analysis,
      meta,
    } satisfies InsightAnalyzeResponse;

    return jsonOk(response);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to analyze insight payload.");
  }
}
