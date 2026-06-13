import { addDays, formatISO } from "date-fns";

import {
  analyzeJournalText,
  createMoodLog,
  deriveWellnessSnapshot,
  enumerateDates,
} from "@/lib/analytics/engines";
import type { DemoSnapshot, ExamType, MoodLog, PreparationStage, StudentProfile } from "@/lib/types";
import { clamp } from "@/lib/utils";

type PersonaDefinition = {
  id: string;
  name: string;
  examType: ExamType;
  preparationStage: PreparationStage;
  focusSubjects: string[];
  mockScoreContext: string;
  targetExamOffsetDays: number;
  dominantTriggers: string[];
  energyCurve: number[];
  journalTemplates: string[];
};

const PERSONAS: PersonaDefinition[] = [
  {
    id: "jee-precision",
    name: "Aarav Sharma",
    examType: "JEE",
    preparationStage: "mock-intense",
    focusSubjects: ["Physics", "Mathematics"],
    mockScoreContext: "Mock scores vary between 162 and 188, with confidence crashes after Physics sections.",
    targetExamOffsetDays: 32,
    dominantTriggers: ["family", "mock", "comparison", "sleep"],
    energyCurve: [0, -1, 1, 0, -2, 1, 2],
    journalTemplates: [
      "Parents keep asking my score and I feel pressure to get into IIT even when I am trying to stay focused.",
      "The mock test result shook my confidence again and I keep comparing myself with batchmates who seem ahead.",
      "I lost time in Physics numericals, slept late, and now the backlog feels heavier than it should.",
      "A short walk helped a little, but the fear of failure comes back whenever rank discussions start.",
    ],
  },
  {
    id: "neet-steady",
    name: "Meera Nair",
    examType: "NEET",
    preparationStage: "revision",
    focusSubjects: ["Biology", "Chemistry"],
    mockScoreContext: "Strong in Biology revision, but confidence dips after Chemistry mistakes.",
    targetExamOffsetDays: 41,
    dominantTriggers: ["sleep", "mock", "future", "family"],
    energyCurve: [1, 0, -1, 0, 1, -1, 2],
    journalTemplates: [
      "Revision is going on, but I keep worrying that one poor mock test could change my future career plans.",
      "I slept badly again and the stress made Chemistry mistakes feel bigger than they were.",
      "My family is supportive, yet every conversation about medical college adds pressure in the background.",
      "After finishing a Biology checklist I felt calmer, and exercise helped me recover some confidence.",
    ],
  },
  {
    id: "upsc-marathon",
    name: "Sana Khan",
    examType: "UPSC",
    preparationStage: "foundation",
    focusSubjects: ["Polity", "Answer Writing"],
    mockScoreContext: "Good conceptual understanding but frustration with long-form answer consistency.",
    targetExamOffsetDays: 58,
    dominantTriggers: ["future", "time", "confidence", "comparison"],
    energyCurve: [0, 1, -1, -1, 1, 0, 2],
    journalTemplates: [
      "The future feels uncertain when answer writing goes badly and I wonder if I can stay consistent for this long exam journey.",
      "Time management slipped today, and unfinished targets made me compare myself with peers preparing full-time.",
      "When I complete revision tasks I feel steadier, but self-doubt returns if a mock answer is weak.",
      "A calmer evening routine and one focused study sprint helped me recover after a low-confidence afternoon.",
    ],
  },
];

function buildProfile(persona: PersonaDefinition): StudentProfile {
  return {
    id: persona.id,
    name: persona.name,
    email: `${persona.id}@demo.local`,
    examType: persona.examType,
    preparationStage: persona.preparationStage,
    targetExamDate: formatISO(addDays(new Date(), persona.targetExamOffsetDays), {
      representation: "date",
    }),
    focusSubjects: persona.focusSubjects,
    mockScoreContext: persona.mockScoreContext,
    demoPersona: persona.id,
    timezone: "Asia/Kolkata",
  };
}

function buildEventTags(dayIndex: number) {
  const tags: string[] = [];

  if (dayIndex % 7 === 5) {
    tags.push("mock-test-tomorrow");
  }

  if (dayIndex % 7 === 6) {
    tags.push("mock-test");
  }

  if (dayIndex % 9 === 6) {
    tags.push("low-score");
  }

  if (dayIndex % 4 === 1) {
    tags.push("exercise");
  }

  if (dayIndex % 3 === 0) {
    tags.push("revision-complete");
  }

  return tags;
}

function buildMoodLogForDay(
  profile: StudentProfile,
  persona: PersonaDefinition,
  date: string,
  dayIndex: number,
): MoodLog {
  const eventTags = buildEventTags(dayIndex);
  const energyShift = persona.energyCurve[dayIndex % persona.energyCurve.length] ?? 0;
  const examCountdownPressure = clamp(
    10 - Math.floor((persona.targetExamOffsetDays - (44 - dayIndex)) / 7),
    2,
    9,
  );
  const stress = clamp(
    5 +
      energyShift * -1 +
      (eventTags.includes("mock-test-tomorrow") ? 3 : 0) +
      (eventTags.includes("low-score") ? 2 : 0) +
      (dayIndex > 30 ? 1 : 0),
    2,
    10,
  );
  const mood = clamp(
    7 +
      energyShift -
      (eventTags.includes("mock-test-tomorrow") ? 2 : 0) -
      (eventTags.includes("low-score") ? 2 : 0),
    2,
    9,
  );
  const confidence = clamp(
    7 +
      (eventTags.includes("revision-complete") ? 1 : 0) -
      (eventTags.includes("low-score") ? 3 : 0) -
      (dayIndex > 34 ? 1 : 0),
    2,
    9,
  );
  const motivation = clamp(
    7 +
      (eventTags.includes("exercise") ? 1 : 0) -
      (eventTags.includes("mock-test-tomorrow") ? 1 : 0) +
      energyShift,
    2,
    9,
  );
  const sleepHours = clamp(
    7 +
      (eventTags.includes("exercise") ? 0.5 : 0) -
      (eventTags.includes("mock-test-tomorrow") ? 1.2 : 0) -
      (dayIndex > 36 ? 0.4 : 0),
    4.8,
    8.4,
  );
  const studyConsistency = clamp(
    72 +
      (eventTags.includes("revision-complete") ? 10 : 0) -
      (eventTags.includes("low-score") ? 8 : 0) -
      examCountdownPressure,
    42,
    94,
  );
  const goalCompletion = clamp(
    68 +
      (eventTags.includes("revision-complete") ? 16 : 0) -
      (eventTags.includes("mock-test-tomorrow") ? 6 : 0),
    40,
    96,
  );

  return createMoodLog(profile.id, date, {
    mood,
    stress,
    confidence,
    motivation,
    sleepHours: Number(sleepHours.toFixed(1)),
    studyConsistency,
    goalCompletion,
    eventTags,
    notes: `Daily ${profile.examType} prep check-in`,
  });
}

function buildJournalText(persona: PersonaDefinition, dayIndex: number, eventTags: string[]) {
  const base = persona.journalTemplates[dayIndex % persona.journalTemplates.length] ?? persona.journalTemplates[0];

  const eventSentence = eventTags.includes("mock-test-tomorrow")
    ? " Tomorrow's mock is making my chest feel tight and I keep replaying past score mistakes."
    : eventTags.includes("low-score")
      ? " Today's low score made me doubt myself and compare my progress with others again."
      : eventTags.includes("exercise")
        ? " A short walk and stretching session gave me a little emotional relief."
        : eventTags.includes("revision-complete")
          ? " Completing my revision checklist gave me one solid proof that progress is real."
          : " I am trying to keep going even when the pressure shows up in small ways.";

  return `${base}${eventSentence}`;
}

export function buildDemoSnapshot(personaId = "jee-precision"): DemoSnapshot {
  const persona = PERSONAS.find((item) => item.id === personaId) ?? PERSONAS[0];
  const profile = buildProfile(persona);
  const dates = enumerateDates(45);

  const moodLogs = dates.map((date, dayIndex) => buildMoodLogForDay(profile, persona, date, dayIndex));
  const journalEntries = dates.map((date, dayIndex) => {
    const eventTags = buildEventTags(dayIndex);
    const text = buildJournalText(persona, dayIndex, eventTags);

    return analyzeJournalText(
      text,
      date,
      `${profile.examType} reflection ${dayIndex + 1}`,
      "What felt heavy today and what helped even a little?",
      profile.id,
    );
  });

  return deriveWellnessSnapshot(profile, journalEntries, moodLogs);
}

export function listDemoPersonas() {
  return PERSONAS.map((persona) => ({
    id: persona.id,
    name: persona.name,
    examType: persona.examType,
    tagline:
      persona.examType === "JEE"
        ? "Family pressure + mock-test anxiety"
        : persona.examType === "NEET"
          ? "Revision stress + sleep disruption"
          : "Consistency strain + future uncertainty",
  }));
}
