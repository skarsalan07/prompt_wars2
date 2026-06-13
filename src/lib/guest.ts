import { addDays, formatISO } from "date-fns";

import { deriveWellnessSnapshot } from "@/lib/analytics/engines";
import type { DemoSnapshot, ExamType, JournalEntry, MoodLog, StudentProfile } from "@/lib/types";

export function buildGuestProfile(examType: ExamType): StudentProfile {
  return {
    id: "guest-user",
    name: "Student",
    examType,
    preparationStage: "revision",
    targetExamDate: formatISO(addDays(new Date(), 30), { representation: "date" }),
    focusSubjects: [],
    mockScoreContext: "",
    timezone: "Asia/Kolkata",
  };
}

export function buildGuestSnapshot(
  examType: ExamType,
  journalEntries: JournalEntry[] = [],
  moodLogs: MoodLog[] = [],
): DemoSnapshot {
  return deriveWellnessSnapshot(buildGuestProfile(examType), journalEntries, moodLogs);
}
