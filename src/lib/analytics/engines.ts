import {
  addDays,
  differenceInCalendarDays,
  formatISO,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";

import { COPING_KEYWORDS, NEGATIVE_WORDS, POSITIVE_WORDS, TRIGGER_TAXONOMY } from "@/lib/analytics/taxonomy";
import type {
  AssistantMemorySummary,
  AIResponseMeta,
  BurnoutForecast,
  CoachResponse,
  DailyInsight,
  DemoSnapshot,
  EmotionVector,
  HeatmapCell,
  JournalEntry,
  MoodLog,
  MotivationIndexPoint,
  PatternInsight,
  RecoveryPlan,
  StudentProfile,
  TriggerClusterSummary,
  TriggerMention,
} from "@/lib/types";
import { clamp, average, createId, round, slugify, unique } from "@/lib/utils";

const CRISIS_PATTERNS = [
  /harm myself/i,
  /end it/i,
  /not worth living/i,
  /can'?t go on/i,
  /disappear forever/i,
];

const NEGATIVE_THOUGHT_PATTERNS = [
  "I am behind",
  "I am not good enough",
  "I will fail",
  "Everyone else is ahead",
  "I cannot handle this",
];

function getJournalForDate(entries: JournalEntry[], date: string) {
  return entries.find((entry) => isSameDay(parseISO(entry.entryDate), parseISO(date)));
}

function getMoodForDate(logs: MoodLog[], date: string) {
  return logs.find((log) => isSameDay(parseISO(log.entryDate), parseISO(date)));
}

export function detectSafetyFlag(text: string) {
  const urgent = CRISIS_PATTERNS.some((pattern) => pattern.test(text));

  if (urgent) {
    return {
      level: "urgent" as const,
      reason: "Potential crisis-risk language detected",
      supportMessage:
        "You deserve immediate support. Pause studying, step away from being alone, and contact a trusted person or a local crisis helpline right now.",
    };
  }

  if (/panic|can't breathe|breakdown/i.test(text)) {
    return {
      level: "support" as const,
      reason: "High-intensity anxiety language detected",
      supportMessage:
        "Slow down for two minutes, loosen your shoulders, and try one grounding step before returning to study.",
    };
  }

  return {
    level: "none" as const,
    reason: "No immediate risk signals detected",
    supportMessage: "Keep checking in with yourself and reach out if stress starts feeling unmanageable.",
  };
}

export function scoreSentiment(text: string) {
  const normalized = text.toLowerCase();
  const positiveHits = POSITIVE_WORDS.filter((word) => normalized.includes(word)).length;
  const negativeHits = NEGATIVE_WORDS.filter((word) => normalized.includes(word)).length;

  return clamp(round(50 + positiveHits * 8 - negativeHits * 7), 0, 100);
}

export function detectNegativeThoughts(text: string) {
  const normalized = text.toLowerCase();

  return NEGATIVE_THOUGHT_PATTERNS.filter((thought) =>
    normalized.includes(thought.toLowerCase().replace("i ", "")) ||
    normalized.includes(thought.toLowerCase()),
  );
}

export function buildEmotionVector(text: string, stressIntensity = 5): EmotionVector {
  const sentiment = scoreSentiment(text);

  return {
    calm: clamp(round((sentiment - stressIntensity * 2) / 10), 0, 10),
    anxious: clamp(round((100 - sentiment + stressIntensity * 6) / 15), 0, 10),
    hopeful: clamp(round(sentiment / 12), 0, 10),
    exhausted: clamp(round((stressIntensity * 8 + (100 - sentiment)) / 18), 0, 10),
  };
}

export function extractCopingActions(text: string) {
  const normalized = text.toLowerCase();
  return COPING_KEYWORDS.filter((keyword) => normalized.includes(keyword));
}

export function extractTriggerMentions(
  text: string,
  entryDate: string,
  source: "journal" | "mood",
  stress = 5,
) {
  const normalized = text.toLowerCase();

  return TRIGGER_TAXONOMY.flatMap((definition) => {
    const matchedKeywords = definition.keywords.filter((keyword) => normalized.includes(keyword));
    if (!matchedKeywords.length) {
      return [];
    }

    const evidenceKeyword = matchedKeywords[0];
    const evidenceStart = Math.max(0, normalized.indexOf(evidenceKeyword) - 24);
    const evidenceEnd = Math.min(text.length, evidenceStart + 96);

    const severity = clamp(Math.round(stress / 2 + matchedKeywords.length), 1, 5);

    return [
      {
        id: createId(`${slugify(definition.canonicalLabel)}-${entryDate}-${source}`),
        canonicalLabel: definition.canonicalLabel,
        category: definition.category,
        severity,
        evidenceSnippet: text.slice(evidenceStart, evidenceEnd).trim(),
        confidence: clamp(0.62 + matchedKeywords.length * 0.08, 0.62, 0.96),
        source,
        entryDate,
      } satisfies TriggerMention,
    ];
  });
}

export function analyzeJournalText(
  text: string,
  entryDate: string,
  title: string,
  reflectionPrompt: string,
  userId: string,
) {
  const stressIntensity = clamp(Math.round((100 - scoreSentiment(text)) / 10), 1, 10);
  const sentimentScore = scoreSentiment(text);
  const motivationLevel = clamp(Math.round(sentimentScore / 10), 1, 10);
  const confidenceLevel = clamp(Math.round((sentimentScore + 20) / 12), 1, 10);

  return {
    id: createId(`${userId}-${entryDate}-${slugify(title)}`),
    userId,
    entryDate,
    title,
    reflectionPrompt,
    textPreview: text.slice(0, 180),
    plainText: text,
    sentimentScore,
    negativeThoughts: detectNegativeThoughts(text),
    triggerMentions: extractTriggerMentions(text, entryDate, "journal", stressIntensity),
    copingActions: extractCopingActions(text),
    anxietyIndicator: clamp(Math.round((100 - sentimentScore) / 12), 1, 10),
    stressIntensity,
    confidenceLevel,
    motivationLevel,
    emotionVector: buildEmotionVector(text, stressIntensity),
    safetyFlag: detectSafetyFlag(text),
  } satisfies JournalEntry;
}

export function buildHeatmap(logs: MoodLog[], examDate: string): HeatmapCell[] {
  return logs.map((log) => ({
    date: log.entryDate,
    mood: log.mood,
    stress: log.stress,
    confidence: log.confidence,
    motivation: log.motivation,
    countdownDay: differenceInCalendarDays(parseISO(examDate), parseISO(log.entryDate)),
  }));
}

export function clusterTriggers(
  entries: JournalEntry[],
  logs: MoodLog[],
  periodDays: number,
) {
  const start = subDays(new Date(), periodDays - 1);
  const relevantEntries = entries.filter((entry) => parseISO(entry.entryDate) >= start);

  const grouped = new Map<string, TriggerClusterSummary>();

  relevantEntries.forEach((entry) => {
    const mood = getMoodForDate(logs, entry.entryDate);

    entry.triggerMentions.forEach((mention) => {
      const existing = grouped.get(mention.canonicalLabel);
      const stressValue = mood?.stress ?? entry.stressIntensity;
      const confidenceDrop = 10 - (mood?.confidence ?? entry.confidenceLevel);
      const sleepDeficit = clamp(8 - (mood?.sleepHours ?? 7), 0, 8);

      if (!existing) {
        grouped.set(mention.canonicalLabel, {
          canonicalLabel: mention.canonicalLabel,
          category: mention.category,
          frequency: 1,
          impactScore: 0,
          averageStress: stressValue,
          averageConfidenceDrop: confidenceDrop,
          averageSleepDeficit: sleepDeficit,
          evidenceSnippets: [mention.evidenceSnippet],
          mentionDates: [mention.entryDate],
        });
        return;
      }

      existing.frequency += 1;
      existing.averageStress = average([existing.averageStress, stressValue]);
      existing.averageConfidenceDrop = average([existing.averageConfidenceDrop, confidenceDrop]);
      existing.averageSleepDeficit = average([existing.averageSleepDeficit, sleepDeficit]);
      existing.evidenceSnippets = unique([...existing.evidenceSnippets, mention.evidenceSnippet]).slice(0, 3);
      existing.mentionDates = unique([...existing.mentionDates, mention.entryDate]);
    });
  });

  const summaries = Array.from(grouped.values());
  const maxFrequency = Math.max(...summaries.map((summary) => summary.frequency), 1);

  return summaries
    .map((summary) => {
      const frequencyScore = (summary.frequency / maxFrequency) * 100;
      const stressScore = (summary.averageStress / 10) * 100;
      const confidenceScore = (summary.averageConfidenceDrop / 10) * 100;
      const sleepScore = (summary.averageSleepDeficit / 8) * 100;

      return {
        ...summary,
        impactScore: round(
          frequencyScore * 0.4 + stressScore * 0.3 + confidenceScore * 0.2 + sleepScore * 0.1,
        ),
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore);
}

function calculateSlope(values: number[]) {
  if (values.length < 2) {
    return 0;
  }

  const first = values[0] ?? 0;
  const last = values.at(-1) ?? 0;
  return last - first;
}

export function computeBurnoutForecast(
  logs: MoodLog[],
  entries: JournalEntry[],
  topTriggers: TriggerClusterSummary[],
  examDate: string,
): BurnoutForecast {
  const recentLogs = logs.slice(-30);
  const recentEntries = entries.slice(-30);

  if (!recentLogs.length && !recentEntries.length) {
    return {
      currentRiskBand: "low",
      currentScore: 18,
      forecast7d: {
        riskBand: "low",
        probability: 22,
        score: 22,
      },
      forecast30d: {
        riskBand: "low",
        probability: 28,
        score: 28,
      },
      reasonFactors: [
        "Not enough history yet. Log mood, sleep, and one reflection daily to unlock predictive forecasting.",
      ],
    };
  }

  const moodTrend = calculateSlope(recentLogs.map((log) => log.mood));
  const sleepTrend = calculateSlope(recentLogs.map((log) => log.sleepHours));
  const motivationSlope = calculateSlope(recentLogs.map((log) => log.motivation));
  const studyConsistency = average(recentLogs.map((log) => log.studyConsistency));
  const averageStress = average(recentLogs.map((log) => log.stress));
  const negativity = 100 - average(recentEntries.map((entry) => entry.sentimentScore));
  const triggerIntensity = average(topTriggers.slice(0, 3).map((trigger) => trigger.impactScore));
  const daysUntilExam = clamp(differenceInCalendarDays(parseISO(examDate), new Date()), 0, 365);
  const examPressure = clamp(100 - daysUntilExam * 2, 0, 100);

  const rawScore =
    (10 - average(recentLogs.map((log) => log.mood))) * 7 +
    clamp(-moodTrend * 4, 0, 16) +
    averageStress * 5 +
    clamp(-sleepTrend * 8, 0, 24) +
    clamp(-motivationSlope * 7, 0, 21) +
    ((100 - studyConsistency) / 100) * 14 +
    (negativity / 100) * 13 +
    (triggerIntensity / 100) * 12 +
    (examPressure / 100) * 9;

  const currentScore = clamp(round(rawScore), 0, 100);
  const projected7d = clamp(round(currentScore + averageStress * 0.8 + clamp(-sleepTrend * 5, 0, 10)), 0, 100);
  const projected30d = clamp(round(projected7d + (examPressure / 100) * 12 + (triggerIntensity / 100) * 8), 0, 100);

  const reasonFactors = [
    averageStress >= 7 ? "Stress intensity is elevated across recent check-ins." : "",
    sleepTrend < 0 ? "Sleep duration is trending downward." : "",
    motivationSlope < 0 ? "Motivation has declined across the recent study window." : "",
    examPressure >= 60 ? "Exam proximity is amplifying pressure." : "",
    negativity >= 55 ? "Journal language has become more negative or self-critical." : "",
    studyConsistency <= 55 ? "Study consistency is unstable, which increases burnout risk." : "",
  ].filter(Boolean);

  return {
    currentRiskBand: scoreToBand(currentScore),
    currentScore,
    forecast7d: {
      riskBand: scoreToBand(projected7d),
      probability: clamp(projected7d, 0, 100),
      score: projected7d,
    },
    forecast30d: {
      riskBand: scoreToBand(projected30d),
      probability: clamp(projected30d, 0, 100),
      score: projected30d,
    },
    reasonFactors,
  };
}

export function scoreToBand(score: number) {
  if (score >= 70) {
    return "high" as const;
  }

  if (score >= 40) {
    return "medium" as const;
  }

  return "low" as const;
}

export function computeMotivationTrend(logs: MoodLog[], entries: JournalEntry[]) {
  let previousSmoothed = 50;

  return logs.map((log) => {
    const journal = getJournalForDate(entries, log.entryDate);
    const positivity = journal?.sentimentScore ?? 50;
    const moodStability = clamp(100 - Math.abs(log.stress - log.mood) * 8, 0, 100);
    const rawScore = round(
      positivity * 0.25 +
        log.goalCompletion * 0.25 +
        moodStability * 0.25 +
        log.studyConsistency * 0.25,
    );
    const smoothedScore = round(rawScore * 0.28 + previousSmoothed * 0.72);
    previousSmoothed = smoothedScore;

    return {
      date: log.entryDate,
      rawScore,
      smoothedScore,
    } satisfies MotivationIndexPoint;
  });
}

function findEventWindows(logs: MoodLog[], eventTag: string) {
  return logs.filter((log) => log.eventTags.includes(eventTag));
}

export function detectPatterns(
  logs: MoodLog[],
  entries: JournalEntry[],
  examDate: string,
): PatternInsight[] {
  const patterns: PatternInsight[] = [];
  const mockWindows = findEventWindows(logs, "mock-test-tomorrow");
  const lowScoreWindows = findEventWindows(logs, "low-score");
  const exerciseWindows = findEventWindows(logs, "exercise");
  const revisionWindows = findEventWindows(logs, "revision-complete");
  const countdownWindows = logs.filter(
    (log) => differenceInCalendarDays(parseISO(examDate), parseISO(log.entryDate)) <= 14,
  );

  if (mockWindows.length >= 2) {
    patterns.push({
      id: "pattern-mock-anxiety",
      type: "before_mock_test",
      title: "Anxiety rises before mock tests",
      summary:
        "Your stress climbs in the 24–48 hours before mock tests, then eases once the test is completed.",
      confidence: clamp(0.7 + mockWindows.length * 0.03, 0.7, 0.95),
      evidenceSnippets: mockWindows.map((log) => `${log.entryDate}: stress ${log.stress}/10 before mock test`).slice(0, 3),
      recommendedAction: "Use a 20-minute light revision block and a breathing reset the evening before each mock test.",
    });
  }

  if (lowScoreWindows.length >= 2) {
    patterns.push({
      id: "pattern-low-score-confidence",
      type: "after_low_score",
      title: "Confidence dips after lower scores",
      summary:
        "Low score events are followed by a measurable confidence drop and more self-critical journal language.",
      confidence: clamp(0.68 + lowScoreWindows.length * 0.04, 0.68, 0.94),
      evidenceSnippets: lowScoreWindows.map((log) => `${log.entryDate}: confidence ${log.confidence}/10 after a low score`).slice(0, 3),
      recommendedAction: "Add a post-mock reflection ritual that separates score analysis from self-worth.",
    });
  }

  if (exerciseWindows.length >= 2) {
    patterns.push({
      id: "pattern-exercise-recovery",
      type: "after_exercise",
      title: "Exercise days improve emotional recovery",
      summary:
        "Your mood and motivation rebound more quickly on days that include even short exercise sessions.",
      confidence: clamp(0.65 + exerciseWindows.length * 0.05, 0.65, 0.9),
      evidenceSnippets: exerciseWindows.map((log) => `${log.entryDate}: mood ${log.mood}/10 after exercise`).slice(0, 3),
      recommendedAction: "Keep a 15-minute walk or mobility reset as a non-negotiable part of stressful weeks.",
    });
  }

  if (revisionWindows.length >= 2) {
    patterns.push({
      id: "pattern-revision-confidence",
      type: "after_revision_completion",
      title: "Completed revision blocks restore confidence",
      summary:
        "When you finish revision checklists, confidence stabilizes and stress reduces by the next check-in.",
      confidence: clamp(0.66 + revisionWindows.length * 0.04, 0.66, 0.92),
      evidenceSnippets: revisionWindows.map((log) => `${log.entryDate}: revision completion paired with confidence ${log.confidence}/10`).slice(0, 3),
      recommendedAction: "Break larger revision goals into visible checklists so your brain registers progress sooner.",
    });
  }

  if (countdownWindows.length >= 5) {
    patterns.push({
      id: "pattern-countdown-pressure",
      type: "countdown_pressure",
      title: "Pressure spikes in the final two weeks",
      summary:
        "Stress and sleep disruption intensify as the exam countdown enters the final 14 days.",
      confidence: 0.82,
      evidenceSnippets: countdownWindows
        .map((log) => `${log.entryDate}: countdown stress ${log.stress}/10 with sleep ${log.sleepHours}h`)
        .slice(0, 3),
      recommendedAction: "Switch from volume-based study to precision revision and daily recovery protection during countdown weeks.",
    });
  }

  if (!patterns.length) {
    const latest = entries.at(-1);
    patterns.push({
      id: "pattern-default",
      type: "countdown_pressure",
      title: "Early emotional pattern forming",
      summary:
        "Keep logging daily for a week so the system can separate one difficult day from a reliable emotional trend.",
      confidence: 0.55,
      evidenceSnippets: latest ? [latest.textPreview] : ["Not enough history yet for a strong weekly pattern signal."],
      recommendedAction: "Log mood, sleep, and at least one reflection each day this week.",
    });
  }

  return patterns;
}

export function buildMemorySummary(
  topTriggers: TriggerClusterSummary[],
  patterns: PatternInsight[],
  logs: MoodLog[],
  recoveryPlan?: RecoveryPlan,
): AssistantMemorySummary {
  const recentMood = average(logs.slice(-7).map((log) => log.mood));
  const recentConfidence = average(logs.slice(-7).map((log) => log.confidence));

  return {
    summaryDate: formatISO(new Date(), { representation: "date" }),
    topTriggers: topTriggers.slice(0, 3).map((trigger) => trigger.canonicalLabel),
    helpfulCopingStrategies: unique(
      patterns
        .slice(0, 3)
        .flatMap((pattern) => pattern.recommendedAction.split(" and ").map((item) => item.trim())),
    ).slice(0, 4),
    motivationTrend: recentMood >= 6 ? "motivation is stabilizing" : "motivation is slipping under pressure",
    confidenceTrend: recentConfidence >= 6 ? "confidence rebounds after completed study blocks" : "confidence is vulnerable after poor results",
    recoveryWins: recoveryPlan?.tasks.filter((task) => task.done).map((task) => task.title) ?? [],
    noteForCoach:
      topTriggers[0]?.canonicalLabel === "Family Expectations"
        ? "Keep validating effort instead of only outcomes when coaching this student."
        : "Use specific evidence from recent wins to reinforce confidence.",
  };
}

export function generateRecoveryPlan(
  profile: StudentProfile,
  forecast: BurnoutForecast,
  topTriggers: TriggerClusterSummary[],
): RecoveryPlan {
  const daysUntilExam = clamp(differenceInCalendarDays(parseISO(profile.targetExamDate), new Date()), 0, 365);
  const durationDays = daysUntilExam <= 14 ? 3 : 7;
  const topTrigger = topTriggers[0];

  const subjectFocus =
    profile.focusSubjects[0] ??
    (profile.examType === "JEE"
      ? "Physics"
      : profile.examType === "NEET"
        ? "Biology"
        : profile.examType === "UPSC"
          ? "answer writing"
          : "core concepts");

  const tasks = [
    {
      id: "task-study-trim",
      title: `Trim ${subjectFocus} study blocks to focused sprints`,
      type: "study" as const,
      description:
        durationDays === 3
          ? "Use 3 short precision revision blocks instead of marathon sessions."
          : "Replace one overloaded study block each day with a shorter, higher-confidence session.",
      done: false,
    },
    {
      id: "task-mindfulness",
      title: "Reset with 4-6 breathing before study transitions",
      type: "mindfulness" as const,
      description: "Take five slow inhale/exhale cycles before mock review, revision, and bedtime.",
      done: false,
    },
    {
      id: "task-wellness",
      title: "Protect sleep recovery",
      type: "wellness" as const,
      description: "Set a hard stop 45 minutes before bed and avoid score review late at night.",
      done: false,
    },
    {
      id: "task-motivation",
      title: "Log one proof-of-progress checkpoint daily",
      type: "motivation" as const,
      description: "Capture one completed concept, chapter, or solved question set before ending the day.",
      done: false,
    },
  ];

  return {
    id: `${slugify(profile.id)}-recovery-plan`,
    userId: profile.id,
    createdAt: formatISO(new Date()),
    durationDays,
    triggerReason:
      forecast.currentScore >= 70
        ? `Burnout risk is ${forecast.currentRiskBand} at ${forecast.currentScore}/100`
        : topTrigger
          ? `Motivation and stress are being pulled down by ${topTrigger.canonicalLabel}`
          : "Emotional strain trend detected",
    focusArea: topTrigger?.canonicalLabel ?? `${profile.examType} consistency recovery`,
    checkInQuestion: "What is one study decision that would make tomorrow feel lighter but still effective?",
    tasks,
    checkpoints: [
      "Morning: rate stress before the first study block",
      "Afternoon: pause for a 5-minute reset after the most difficult subject",
      "Night: log one win and one stress trigger before sleeping",
    ],
    status: "active",
  };
}

export function buildDailyInsights(
  logs: MoodLog[],
  forecast: BurnoutForecast,
): DailyInsight[] {
  return logs.map((log, index) => ({
    date: log.entryDate,
    mood: log.mood,
    stress: log.stress,
    confidence: log.confidence,
    motivation: log.motivation,
    burnoutScore: clamp(round(forecast.currentScore - 6 + index * 0.5), 0, 100),
  }));
}

export function buildCoachResponse(snapshot: DemoSnapshot, message: string): CoachResponse {
  const topTrigger = snapshot.topTriggers[0];
  const pattern = snapshot.patterns[0];
  const profile = snapshot.profile;
  const safetyFlag = detectSafetyFlag(message);
  const personalizedFocus =
    profile.examType === "JEE"
      ? `${profile.focusSubjects[0] ?? "Physics"} confidence recovery`
      : profile.examType === "NEET"
        ? "revision stress reduction"
        : profile.examType === "UPSC"
          ? "long-term consistency recovery"
          : `${profile.examType} preparation stability`;

  return {
    reply:
      `${profile.name.split(" ")[0]}, I’m seeing ${topTrigger?.canonicalLabel.toLowerCase() ?? "stress overload"} ` +
      `showing up alongside a ${snapshot.burnoutForecast.currentRiskBand} burnout trend. ` +
      `For your ${profile.examType} journey, let’s focus on ${personalizedFocus}. ` +
      `${pattern?.summary ?? "Your recent logs show pressure building faster than recovery."}`,
    recommendedExercises: [
      "2-minute box breathing before your next study block",
      "One 25-minute high-confidence revision sprint",
      "A short written reflection on effort, not just score",
    ],
    suggestedPrompts: [
      "What felt heavy before today’s study session?",
      "Which subject needs a confidence-first plan this week?",
      "What helped even a little on your best recent day?",
    ],
    safetyFlag,
    meta: {
      provider: "local",
      model: "deterministic-fallback",
      usedLiveModel: false,
      mode: "fallback",
      reason: "Using local deterministic coaching fallback.",
    } satisfies AIResponseMeta,
  };
}

export function deriveWellnessSnapshot(
  profile: StudentProfile,
  journalEntries: JournalEntry[],
  moodLogs: MoodLog[],
  existingPlan?: RecoveryPlan,
): DemoSnapshot {
  const topTriggers = clusterTriggers(journalEntries, moodLogs, 30);
  const burnoutForecast = computeBurnoutForecast(moodLogs, journalEntries, topTriggers, profile.targetExamDate);
  const motivationTrend = computeMotivationTrend(moodLogs, journalEntries);
  const heatmap = buildHeatmap(moodLogs, profile.targetExamDate);
  const patterns = detectPatterns(moodLogs, journalEntries, profile.targetExamDate);
  const recoveryPlan =
    existingPlan ??
    generateRecoveryPlan(profile, burnoutForecast, topTriggers);
  const memorySummary = buildMemorySummary(topTriggers, patterns, moodLogs, recoveryPlan);

  return {
    mode: profile.demoPersona ? "demo" : "guest",
    profile,
    journalEntries,
    moodLogs,
    topTriggers,
    burnoutForecast,
    motivationTrend,
    heatmap,
    patterns,
    recoveryPlan,
    memorySummary,
    activeCoachPrompt: `Coach me through ${profile.examType} pressure around ${topTriggers[0]?.canonicalLabel ?? "confidence recovery"}.`,
  };
}

export function createMoodLog(
  userId: string,
  date: string,
  values: Omit<MoodLog, "id" | "userId" | "entryDate">,
) {
  return {
    id: createId(`${userId}-${date}-mood`),
    userId,
    entryDate: date,
    ...values,
  } satisfies MoodLog;
}

export function enumerateDates(days: number) {
  return Array.from({ length: days }, (_, index) =>
    formatISO(startOfDay(addDays(subDays(new Date(), days - 1), index)), {
      representation: "date",
    }),
  );
}
