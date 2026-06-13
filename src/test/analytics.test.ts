import { addDays, formatISO } from "date-fns";

import {
  analyzeJournalText,
  clusterTriggers,
  computeBurnoutForecast,
  computeMotivationTrend,
  createMoodLog,
  detectPatterns,
  deriveWellnessSnapshot,
  generateRecoveryPlan,
} from "@/lib/analytics/engines";
import type { StudentProfile } from "@/lib/types";

function futureDate(days: number) {
  return formatISO(addDays(new Date(), days), { representation: "date" });
}

function buildProfile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    id: "student-1",
    name: "Student One",
    examType: "JEE",
    preparationStage: "mock-intense",
    targetExamDate: futureDate(12),
    focusSubjects: ["Physics"],
    mockScoreContext: "Recent mock scores have dipped.",
    timezone: "Asia/Kolkata",
    ...overrides,
  };
}

describe("analytics engines", () => {
  it("extracts recurring trigger mentions and ranks family expectations highly", () => {
    const entries = [
      analyzeJournalText(
        "Parents keep asking my score and I feel pressure to get into IIT.",
        futureDate(-2),
        "Reflection 1",
        "Prompt",
        "student-1",
      ),
      analyzeJournalText(
        "Family pressure and mock score stress made me compare myself with others.",
        futureDate(-1),
        "Reflection 2",
        "Prompt",
        "student-1",
      ),
    ];

    const moodLogs = [
      createMoodLog("student-1", futureDate(-2), {
        mood: 4,
        stress: 8,
        confidence: 4,
        motivation: 5,
        sleepHours: 5.5,
        studyConsistency: 62,
        goalCompletion: 58,
        eventTags: ["mock-test-tomorrow"],
        notes: "",
      }),
      createMoodLog("student-1", futureDate(-1), {
        mood: 5,
        stress: 9,
        confidence: 3,
        motivation: 4,
        sleepHours: 5.1,
        studyConsistency: 55,
        goalCompletion: 45,
        eventTags: ["low-score"],
        notes: "",
      }),
    ];

    const ranked = clusterTriggers(entries, moodLogs, 30);

    expect(ranked[0]?.canonicalLabel).toBe("Family Expectations");
    expect(ranked[0]?.frequency).toBeGreaterThanOrEqual(1);
    expect(ranked[0]?.impactScore).toBeGreaterThan(60);
  });

  it("forecasts high burnout when mood, sleep, and motivation trends deteriorate", () => {
    const entries = Array.from({ length: 6 }, (_, index) =>
      analyzeJournalText(
        "I feel exhausted, anxious, and scared that I will fail. Sleep is getting worse and mock results are pulling confidence down.",
        futureDate(index - 6),
        `Reflection ${index + 1}`,
        "Prompt",
        "student-1",
      ),
    );
    const moodLogs = Array.from({ length: 6 }, (_, index) =>
      createMoodLog("student-1", futureDate(index - 6), {
        mood: 6 - index,
        stress: 6 + index,
        confidence: 6 - index,
        motivation: 6 - index,
        sleepHours: 6.8 - index * 0.35,
        studyConsistency: 70 - index * 5,
        goalCompletion: 68 - index * 4,
        eventTags: index % 2 === 0 ? ["mock-test-tomorrow"] : ["low-score"],
        notes: "",
      }),
    );

    const triggers = clusterTriggers(entries, moodLogs, 30);
    const forecast = computeBurnoutForecast(
      moodLogs,
      entries,
      triggers,
      buildProfile().targetExamDate,
    );

    expect(forecast.currentRiskBand).toBe("high");
    expect(forecast.forecast7d.score).toBeGreaterThanOrEqual(forecast.currentScore);
    expect(forecast.reasonFactors.length).toBeGreaterThan(1);
  });

  it("builds a smoothed motivation trend and identifies patterns", () => {
    const entries = Array.from({ length: 5 }, (_, index) =>
      analyzeJournalText(
        index % 2 === 0
          ? "Exercise helped me feel better and completing revision tasks made me calmer."
          : "Tomorrow's mock test is making me anxious and I keep worrying about my score.",
        futureDate(index - 5),
        `Entry ${index}`,
        "Prompt",
        "student-1",
      ),
    );
    const moodLogs = [
      createMoodLog("student-1", futureDate(-5), {
        mood: 7,
        stress: 5,
        confidence: 6,
        motivation: 7,
        sleepHours: 7.2,
        studyConsistency: 80,
        goalCompletion: 82,
        eventTags: ["exercise", "revision-complete"],
        notes: "",
      }),
      createMoodLog("student-1", futureDate(-4), {
        mood: 5,
        stress: 8,
        confidence: 4,
        motivation: 5,
        sleepHours: 6.2,
        studyConsistency: 72,
        goalCompletion: 60,
        eventTags: ["mock-test-tomorrow"],
        notes: "",
      }),
      createMoodLog("student-1", futureDate(-3), {
        mood: 6,
        stress: 6,
        confidence: 6,
        motivation: 6,
        sleepHours: 7,
        studyConsistency: 78,
        goalCompletion: 80,
        eventTags: ["exercise"],
        notes: "",
      }),
      createMoodLog("student-1", futureDate(-2), {
        mood: 4,
        stress: 9,
        confidence: 3,
        motivation: 4,
        sleepHours: 5.8,
        studyConsistency: 65,
        goalCompletion: 52,
        eventTags: ["low-score", "mock-test-tomorrow"],
        notes: "",
      }),
      createMoodLog("student-1", futureDate(-1), {
        mood: 7,
        stress: 4,
        confidence: 7,
        motivation: 7,
        sleepHours: 7.4,
        studyConsistency: 82,
        goalCompletion: 84,
        eventTags: ["revision-complete"],
        notes: "",
      }),
    ];

    const motivationTrend = computeMotivationTrend(moodLogs, entries);
    const patterns = detectPatterns(moodLogs, entries, buildProfile().targetExamDate);

    expect(motivationTrend).toHaveLength(5);
    expect(motivationTrend.at(-1)?.smoothedScore).toBeGreaterThan(0);
    expect(patterns.map((pattern) => pattern.type)).toContain("before_mock_test");
    expect(patterns.map((pattern) => pattern.type)).toContain("after_exercise");
  });

  it("creates a short recovery plan when the exam is within two weeks", () => {
    const profile = buildProfile({ targetExamDate: futureDate(7) });
    const snapshot = deriveWellnessSnapshot(profile, [], []);
    const plan = generateRecoveryPlan(profile, snapshot.burnoutForecast, snapshot.topTriggers);

    expect(plan.durationDays).toBe(3);
    expect(plan.tasks).toHaveLength(4);
  });
});
