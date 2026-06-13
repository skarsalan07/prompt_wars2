import { MongoClient } from "mongodb";

import { buildDailyInsights, buildMemorySummary, deriveWellnessSnapshot } from "@/lib/analytics/engines";
import type {
  AssistantMemorySummary,
  DemoSnapshot,
  EmotionalInsightDocument,
  JournalEntry,
  MoodLog,
  RecoveryPlan,
  StudentProfile,
} from "@/lib/types";

type UserDocument = StudentProfile & {
  memorySummary?: AssistantMemorySummary;
  createdAt: string;
  updatedAt: string;
};

function getDb(client: MongoClient) {
  return client.db(process.env.MONGODB_DB_NAME ?? "mental_wellness");
}

let indexesEnsured = false;

export async function ensureIndexes(client: MongoClient) {
  if (indexesEnsured) {
    return;
  }

  const db = getDb(client);

  await Promise.all([
    db.collection<JournalEntry>("JournalEntries").createIndex({ userId: 1, entryDate: -1 }),
    db.collection<MoodLog>("MoodLogs").createIndex({ userId: 1, entryDate: -1 }),
    db.collection<EmotionalInsightDocument>("EmotionalInsights").createIndex({
      userId: 1,
      "periodSummaries.periodType": 1,
      "periodSummaries.periodStart": -1,
    }),
    db.collection<RecoveryPlan>("WellnessPlans").createIndex({ userId: 1, status: 1, createdAt: -1 }),
    db.collection<UserDocument>("Users").createIndex({ examType: 1, demoPersona: 1 }),
    db.collection("RateLimits").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);

  indexesEnsured = true;
}

export async function saveJournalEntry(client: MongoClient, entry: JournalEntry) {
  await ensureIndexes(client);
  await getDb(client).collection<JournalEntry>("JournalEntries").insertOne(entry);
}

export async function saveMoodLog(client: MongoClient, moodLog: MoodLog) {
  await ensureIndexes(client);
  await getDb(client).collection<MoodLog>("MoodLogs").insertOne(moodLog);
}

export async function saveRecoveryPlan(client: MongoClient, plan: RecoveryPlan) {
  await ensureIndexes(client);
  await getDb(client)
    .collection<RecoveryPlan>("WellnessPlans")
    .updateOne({ id: plan.id }, { $set: plan }, { upsert: true });
}

export async function upsertUser(client: MongoClient, profile: StudentProfile, memorySummary?: AssistantMemorySummary) {
  await ensureIndexes(client);
  await getDb(client)
    .collection<UserDocument>("Users")
    .updateOne(
      { id: profile.id },
      {
        $set: {
          ...profile,
          memorySummary,
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: {
          createdAt: new Date().toISOString(),
        },
      },
      { upsert: true },
    );
}

export async function upsertInsights(client: MongoClient, snapshot: DemoSnapshot) {
  await ensureIndexes(client);
  const weeklyPeriod = {
    periodType: "weekly" as const,
    periodStart: snapshot.moodLogs.at(-7)?.entryDate ?? snapshot.moodLogs[0]?.entryDate ?? new Date().toISOString(),
    topTriggers: snapshot.topTriggers.slice(0, 5),
    burnoutForecast: snapshot.burnoutForecast,
    motivationTrend: snapshot.motivationTrend.slice(-7),
    patterns: snapshot.patterns,
    memorySummary: snapshot.memorySummary,
  };
  const monthlyPeriod = {
    periodType: "monthly" as const,
    periodStart: snapshot.moodLogs[0]?.entryDate ?? new Date().toISOString(),
    topTriggers: snapshot.topTriggers.slice(0, 5),
    burnoutForecast: snapshot.burnoutForecast,
    motivationTrend: snapshot.motivationTrend,
    patterns: snapshot.patterns,
    memorySummary: snapshot.memorySummary,
  };

  await getDb(client)
    .collection<EmotionalInsightDocument>("EmotionalInsights")
    .updateOne(
      { userId: snapshot.profile.id },
      {
        $set: {
          userId: snapshot.profile.id,
          dailyInsights: buildDailyInsights(snapshot.moodLogs, snapshot.burnoutForecast),
          periodSummaries: [weeklyPeriod, monthlyPeriod],
          heatmap: snapshot.heatmap,
        },
      },
      { upsert: true },
    );
}

export async function getUserSnapshot(client: MongoClient, userId: string) {
  await ensureIndexes(client);
  const db = getDb(client);
  const [profile, journalEntries, moodLogs, plan] = await Promise.all([
    db.collection<UserDocument>("Users").findOne({ id: userId }),
    db.collection<JournalEntry>("JournalEntries").find({ userId }).sort({ entryDate: 1 }).toArray(),
    db.collection<MoodLog>("MoodLogs").find({ userId }).sort({ entryDate: 1 }).toArray(),
    db.collection<RecoveryPlan>("WellnessPlans").findOne({ userId, status: "active" }, { sort: { createdAt: -1 } }),
  ]);

  if (!profile) {
    return null;
  }

  const snapshot = deriveWellnessSnapshot(profile, journalEntries, moodLogs, plan ?? undefined);
  const memorySummary = buildMemorySummary(snapshot.topTriggers, snapshot.patterns, snapshot.moodLogs, snapshot.recoveryPlan);
  await upsertUser(client, profile, memorySummary);
  await upsertInsights(client, snapshot);

  return {
    ...snapshot,
    memorySummary,
  };
}

export async function mergeGuestData(
  client: MongoClient,
  profile: StudentProfile,
  journalEntries: JournalEntry[],
  moodLogs: MoodLog[],
) {
  const snapshot = deriveWellnessSnapshot(profile, journalEntries, moodLogs);
  await upsertUser(client, profile, snapshot.memorySummary);

  if (journalEntries.length) {
    await getDb(client).collection<JournalEntry>("JournalEntries").insertMany(journalEntries, { ordered: false });
  }

  if (moodLogs.length) {
    await getDb(client).collection<MoodLog>("MoodLogs").insertMany(moodLogs, { ordered: false });
  }

  await saveRecoveryPlan(client, snapshot.recoveryPlan);
  await upsertInsights(client, snapshot);

  return snapshot;
}
