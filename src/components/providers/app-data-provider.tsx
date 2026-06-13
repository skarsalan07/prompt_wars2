"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import {
  analyzeJournalText,
  buildCoachResponse,
  createMoodLog,
  deriveWellnessSnapshot,
} from "@/lib/analytics/engines";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { buildGuestProfile } from "@/lib/guest";
import type {
  AppMode,
  AIResponseMeta,
  CoachResponse,
  DemoSnapshot,
  InsightAnalysisResult,
  JournalAnalysisResponse,
  MoodLog,
  StudentProfile,
} from "@/lib/types";

type DemoPersonaOption = {
  id: string;
  name: string;
  examType: string;
  tagline: string;
};

type JournalInput = {
  title: string;
  reflectionPrompt: string;
  text: string;
  entryDate: string;
};

type MoodInput = Omit<MoodLog, "id" | "userId">;

type AppDataContextValue = {
  mode: AppMode;
  snapshot: DemoSnapshot;
  demoPersonas: DemoPersonaOption[];
  setMode: (mode: AppMode) => void;
  selectDemoPersona: (personaId: string) => void;
  updateProfile: (profile: Partial<StudentProfile>) => void;
  addJournalEntry: (payload: JournalInput) => Promise<JournalAnalysisResponse>;
  addMoodLog: (payload: MoodInput) => void;
  toggleRecoveryTask: (taskId: string) => void;
  askCoach: (message: string) => Promise<CoachResponse>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);
const STORAGE_KEY = "mental-wellness-intelligence-state";

type StoredGuestState = {
  profile: StudentProfile;
  journalEntries: DemoSnapshot["journalEntries"];
  moodLogs: DemoSnapshot["moodLogs"];
  mode: AppMode;
  demoPersonaId?: string;
};

function persistGuestState(state: StoredGuestState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function buildGuestSnapshotFromStorage(state?: Partial<StoredGuestState>) {
  const profile = state?.profile ?? buildGuestProfile("JEE");
  return deriveWellnessSnapshot(profile, state?.journalEntries ?? [], state?.moodLogs ?? []);
}

function buildLocalJournalResponse(
  snapshot: DemoSnapshot,
  payload: JournalInput,
): JournalAnalysisResponse {
  const entry = analyzeJournalText(
    payload.text,
    payload.entryDate,
    payload.title,
    payload.reflectionPrompt,
    snapshot.profile.id,
  );
  const nextSnapshot = deriveWellnessSnapshot(
    snapshot.profile,
    [...snapshot.journalEntries, entry],
    snapshot.moodLogs,
    snapshot.recoveryPlan,
  );

  return {
    entry,
    analysis: {
      emotionVector: entry.emotionVector,
      triggerMentions: entry.triggerMentions,
      negativeThoughts: entry.negativeThoughts,
      burnoutForecast: nextSnapshot.burnoutForecast,
      anxietyIndicators: [
        entry.anxietyIndicator >= 7 ? "high-anxiety-language" : "",
        entry.stressIntensity >= 7 ? "high-stress-intensity" : "",
      ].filter(Boolean),
      motivationIndex:
        nextSnapshot.motivationTrend.at(-1)?.smoothedScore ?? entry.motivationLevel * 10,
      recommendedActions: nextSnapshot.recoveryPlan.tasks
        .slice(0, 3)
        .map((task) => task.description),
      confidence: 0.68,
      evidenceSpans: entry.triggerMentions.map((trigger) => trigger.evidenceSnippet),
      safetyFlag: entry.safetyFlag,
    } satisfies InsightAnalysisResult,
    meta: {
      provider: "local",
      model: "deterministic-fallback",
      usedLiveModel: false,
      mode: "fallback",
      reason: "Using local analytics because no live API call was made in this mode.",
    } satisfies AIResponseMeta,
  };
}

export function AppDataProvider({
  children,
  initialSnapshot,
  demoPersonas,
}: PropsWithChildren<{
  initialSnapshot: DemoSnapshot;
  demoPersonas: DemoPersonaOption[];
}>) {
  const [mode, setModeState] = useState<AppMode>("demo");
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [demoPersonaId, setDemoPersonaId] = useState(initialSnapshot.profile.demoPersona ?? demoPersonas[0]?.id ?? "jee-precision");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw) as StoredGuestState;
    // Hydration needs to reconcile browser-local anonymous data after the server render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setModeState(parsed.mode ?? "demo");
    setDemoPersonaId(parsed.demoPersonaId ?? demoPersonaId);

    if ((parsed.mode ?? "demo") === "guest") {
      setSnapshot(buildGuestSnapshotFromStorage(parsed));
      return;
    }

    setSnapshot(buildDemoSnapshot(parsed.demoPersonaId ?? demoPersonaId));
    // The initial hydration should run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setMode(nextMode: AppMode) {
    if (nextMode === "demo") {
      const nextSnapshot = buildDemoSnapshot(demoPersonaId);
      setSnapshot(nextSnapshot);
      setModeState("demo");
      persistGuestState({
        profile: buildGuestProfile("JEE"),
        journalEntries: [],
        moodLogs: [],
        mode: "demo",
        demoPersonaId,
      });
      return;
    }

    const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const parsed = raw ? (JSON.parse(raw) as StoredGuestState) : undefined;
    const nextSnapshot = buildGuestSnapshotFromStorage(parsed);
    setSnapshot(nextSnapshot);
    setModeState("guest");
    persistGuestState({
      profile: nextSnapshot.profile,
      journalEntries: nextSnapshot.journalEntries,
      moodLogs: nextSnapshot.moodLogs,
      mode: "guest",
      demoPersonaId,
    });
  }

  function selectDemoPersona(personaId: string) {
    setDemoPersonaId(personaId);
    if (mode === "demo") {
      const nextSnapshot = buildDemoSnapshot(personaId);
      setSnapshot(nextSnapshot);
    }

    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as StoredGuestState) : undefined;
      persistGuestState({
        profile: parsed?.profile ?? buildGuestProfile("JEE"),
        journalEntries: parsed?.journalEntries ?? [],
        moodLogs: parsed?.moodLogs ?? [],
        mode,
        demoPersonaId: personaId,
      });
    }
  }

  function updateProfile(profilePatch: Partial<StudentProfile>) {
    const nextProfile = {
      ...snapshot.profile,
      ...profilePatch,
    };
    const nextSnapshot = deriveWellnessSnapshot(
      nextProfile,
      snapshot.journalEntries,
      snapshot.moodLogs,
      snapshot.recoveryPlan,
    );
    setSnapshot(nextSnapshot);

    if (mode === "guest") {
      persistGuestState({
        profile: nextSnapshot.profile,
        journalEntries: nextSnapshot.journalEntries,
        moodLogs: nextSnapshot.moodLogs,
        mode,
        demoPersonaId,
      });
    }
  }

  async function addJournalEntry(payload: JournalInput) {
    let result = buildLocalJournalResponse(snapshot, payload);

    try {
      const query = mode === "demo" ? `?demoPersona=${encodeURIComponent(demoPersonaId)}` : "";
      const response = await fetch(`/api/journal-entries${query}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          examType: snapshot.profile.examType,
          mode,
        }),
      });

      if (response.ok) {
        result = (await response.json()) as JournalAnalysisResponse;
      }
    } catch {
      // Keep the deterministic local fallback result.
    }

    const nextSnapshot = deriveWellnessSnapshot(
      snapshot.profile,
      [...snapshot.journalEntries, result.entry],
      snapshot.moodLogs,
      snapshot.recoveryPlan,
    );
    setSnapshot(nextSnapshot);

    if (mode === "guest") {
      persistGuestState({
        profile: nextSnapshot.profile,
        journalEntries: nextSnapshot.journalEntries,
        moodLogs: nextSnapshot.moodLogs,
        mode,
        demoPersonaId,
      });
    }

    return result;
  }

  function addMoodLog(payload: MoodInput) {
    const moodLog = createMoodLog(snapshot.profile.id, payload.entryDate, {
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
    const nextSnapshot = deriveWellnessSnapshot(
      snapshot.profile,
      snapshot.journalEntries,
      [...snapshot.moodLogs, moodLog],
      snapshot.recoveryPlan,
    );
    setSnapshot(nextSnapshot);

    if (mode === "guest") {
      persistGuestState({
        profile: nextSnapshot.profile,
        journalEntries: nextSnapshot.journalEntries,
        moodLogs: nextSnapshot.moodLogs,
        mode,
        demoPersonaId,
      });
    }
  }

  function toggleRecoveryTask(taskId: string) {
    const nextSnapshot = {
      ...snapshot,
      recoveryPlan: {
        ...snapshot.recoveryPlan,
        tasks: snapshot.recoveryPlan.tasks.map((task) =>
          task.id === taskId
            ? {
                ...task,
                done: !task.done,
              }
            : task,
        ),
      },
    };
    setSnapshot(nextSnapshot);

    if (mode === "guest") {
      persistGuestState({
        profile: nextSnapshot.profile,
        journalEntries: nextSnapshot.journalEntries,
        moodLogs: nextSnapshot.moodLogs,
        mode,
        demoPersonaId,
      });
    }
  }

  async function askCoach(message: string): Promise<CoachResponse> {
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          mode,
          demoPersona: mode === "demo" ? demoPersonaId : undefined,
        }),
      });

      if (response.ok) {
        return (await response.json()) as CoachResponse;
      }
    } catch {
      // Fall back to local response below.
    }

    return buildCoachResponse(snapshot, message);
  }

  return (
    <AppDataContext.Provider
      value={{
        mode,
        snapshot,
        demoPersonas,
        setMode,
        selectDemoPersona,
        updateProfile,
        addJournalEntry,
        addMoodLog,
        toggleRecoveryTask,
        askCoach,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }

  return context;
}
