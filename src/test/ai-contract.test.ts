import { enhanceInsightAnalysis } from "@/lib/ai/service";
import { aiCoachResponseSchema, aiInsightEnhancementSchema } from "@/lib/ai/schemas";
import { buildDemoSnapshot } from "@/lib/demo/seed";

describe("AI contracts", () => {
  it("validates the insight enhancement schema", () => {
    const result = aiInsightEnhancementSchema.safeParse({
      insightSummary: "Burnout pressure is clustering around family expectations and score anxiety.",
      recommendedActions: [
        "Start Physics with a 25-minute confidence-first problem set.",
        "Protect one no-score hour before bed.",
        "Write one line about effort before rank discussions.",
      ],
      coachAngle: "Validate pressure and shift the student toward controllable actions.",
      motivationalMessage: "A steadier system today matters more than chasing a perfect day.",
      caution: "Avoid productivity-only advice that ignores emotional load.",
    });

    expect(result.success).toBe(true);
  });

  it("falls back gracefully when no provider key is configured", async () => {
    const snapshot = buildDemoSnapshot("jee-precision");
    const journalEntry = snapshot.journalEntries.at(-1)!;
    const output = await enhanceInsightAnalysis(snapshot, journalEntry, {
      emotionVector: journalEntry.emotionVector,
      triggerMentions: journalEntry.triggerMentions,
      negativeThoughts: journalEntry.negativeThoughts,
      burnoutForecast: snapshot.burnoutForecast,
      anxietyIndicators: ["high-stress-intensity"],
      motivationIndex: snapshot.motivationTrend.at(-1)?.smoothedScore ?? 50,
      recommendedActions: [],
      confidence: 0.5,
      evidenceSpans: [],
      safetyFlag: journalEntry.safetyFlag,
    });

    expect(output.recommendedActions.length).toBeGreaterThanOrEqual(3);
    expect(output.confidence).toBeGreaterThanOrEqual(0.74);
  });

  it("validates the coach output schema", () => {
    const result = aiCoachResponseSchema.safeParse({
      reply: "You are under real pressure, so let’s cut tonight into one confident revision block and one recovery block.",
      recommendedExercises: [
        "Take a two-minute breathing reset.",
        "Do one short high-confidence revision sprint.",
      ],
      suggestedPrompts: [
        "What pressure feels loudest right now?",
        "Which subject needs confidence instead of punishment?",
      ],
    });

    expect(result.success).toBe(true);
  });
});
