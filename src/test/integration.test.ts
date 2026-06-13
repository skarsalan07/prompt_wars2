import { addDays, formatISO } from "date-fns";

import { analyzeJournalText, createMoodLog, deriveWellnessSnapshot } from "@/lib/analytics/engines";
import type { StudentProfile } from "@/lib/types";

function futureDate(days: number) {
  return formatISO(addDays(new Date(), days), { representation: "date" });
}

describe("journal + mood integration", () => {
  it("turns reflections and mood logs into one derived snapshot", () => {
    const profile: StudentProfile = {
      id: "student-integration",
      name: "Integration Student",
      examType: "NEET",
      preparationStage: "revision",
      targetExamDate: futureDate(25),
      focusSubjects: ["Biology"],
      mockScoreContext: "Recent Chemistry errors hurt confidence.",
      timezone: "Asia/Kolkata",
    };

    const journalEntries = [
      analyzeJournalText(
        "Revision stress is rising, my family keeps asking about medical college, and poor sleep is making me doubt myself.",
        futureDate(-2),
        "Reflection 1",
        "Prompt",
        profile.id,
      ),
    ];
    const moodLogs = [
      createMoodLog(profile.id, futureDate(-2), {
        mood: 4,
        stress: 8,
        confidence: 4,
        motivation: 5,
        sleepHours: 5.2,
        studyConsistency: 61,
        goalCompletion: 54,
        eventTags: ["low-score"],
        notes: "",
      }),
    ];

    const snapshot = deriveWellnessSnapshot(profile, journalEntries, moodLogs);

    expect(snapshot.topTriggers[0]?.canonicalLabel).toBeTruthy();
    expect(snapshot.burnoutForecast.currentScore).toBeGreaterThan(0);
    expect(snapshot.recoveryPlan.tasks.length).toBeGreaterThanOrEqual(3);
  });
});
