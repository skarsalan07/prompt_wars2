import { NextRequest } from "next/server";

import { guardApiRequest, loadRouteSnapshot } from "@/lib/api";
import { analyzeJournalText, deriveWellnessSnapshot } from "@/lib/analytics/engines";
import { enhanceInsightAnalysis } from "@/lib/ai/service";
import { saveJournalEntry } from "@/lib/db/repository";
import { buildGuestSnapshot } from "@/lib/guest";
import { encryptText } from "@/lib/security/encryption";
import { detectPromptInjection, sanitizePromptInput } from "@/lib/security/prompt-guard";
import { jsonError, jsonOk } from "@/lib/security/response";
import { journalEntryInputSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const { session, client } = await guardApiRequest(request);
    const payload = journalEntryInputSchema.parse(await request.json());
    const cleanedText = sanitizePromptInput(payload.text);

    if (detectPromptInjection(cleanedText)) {
      return jsonError("Journal text contained prompt-injection-like instructions and was rejected.", 400);
    }

    const journalEntry = analyzeJournalText(
      cleanedText,
      payload.entryDate,
      payload.title,
      payload.reflectionPrompt,
      session?.user?.id ?? "guest-user",
    );

    const baseSnapshot =
      (await loadRouteSnapshot(request)) ??
      buildGuestSnapshot(payload.examType, [journalEntry], []);
    const updatedSnapshot = deriveWellnessSnapshot(
      baseSnapshot.profile,
      [...baseSnapshot.journalEntries, journalEntry],
      baseSnapshot.moodLogs,
      baseSnapshot.recoveryPlan,
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
      motivationIndex: updatedSnapshot.motivationTrend.at(-1)?.smoothedScore ?? journalEntry.motivationLevel * 10,
      recommendedActions: [],
      confidence: 0.72,
      evidenceSpans: journalEntry.triggerMentions.map((trigger) => trigger.evidenceSnippet),
      safetyFlag: journalEntry.safetyFlag,
    };
    const { analysis, meta } = await enhanceInsightAnalysis(updatedSnapshot, journalEntry, baseResult);

    if (client && session?.user?.id) {
      await saveJournalEntry(client, {
        ...journalEntry,
        userId: session.user.id,
        encryptedText: encryptText(cleanedText),
        plainText: undefined,
      });
    }

    return jsonOk({
      entry: {
        ...journalEntry,
        plainText: undefined,
      },
      analysis,
      meta,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to analyze journal entry.");
  }
}
