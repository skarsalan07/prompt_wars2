import { NextRequest } from "next/server";

import { guardApiRequest, loadRouteSnapshot } from "@/lib/api";
import { createMoodLog, deriveWellnessSnapshot } from "@/lib/analytics/engines";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { saveMoodLog } from "@/lib/db/repository";
import { moodLogInputSchema } from "@/lib/validation/schemas";
import { jsonError, jsonOk } from "@/lib/security/response";

export async function POST(request: NextRequest) {
  try {
    const { session, client } = await guardApiRequest(request);
    const payload = moodLogInputSchema.parse(await request.json());
    const userId = session?.user?.id ?? "guest-user";
    const moodLog = createMoodLog(userId, payload.entryDate, {
      mood: payload.mood,
      stress: payload.stress,
      confidence: payload.confidence,
      motivation: payload.motivation,
      sleepHours: payload.sleepHours,
      studyConsistency: payload.studyConsistency,
      goalCompletion: payload.goalCompletion,
      eventTags: payload.eventTags,
      notes: payload.notes,
    });

    if (client && session?.user?.id) {
      await saveMoodLog(client, moodLog);
    }

    const existingSnapshot = (await loadRouteSnapshot(request)) ?? buildDemoSnapshot();
    const updatedSnapshot = deriveWellnessSnapshot(
      existingSnapshot.profile,
      existingSnapshot.journalEntries,
      [...existingSnapshot.moodLogs, moodLog],
      existingSnapshot.recoveryPlan,
    );

    return jsonOk({
      moodLog,
      burnoutForecast: updatedSnapshot.burnoutForecast,
      motivation: updatedSnapshot.motivationTrend.at(-1),
      requiresRecoveryPlan:
        updatedSnapshot.burnoutForecast.currentScore >= 70 ||
        (updatedSnapshot.motivationTrend.at(-1)?.smoothedScore ?? 100) <= 40,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to save mood log.");
  }
}
