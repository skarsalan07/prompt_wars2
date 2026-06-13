import { NextRequest } from "next/server";

import { getServerAuthSession } from "@/auth";
import { guardApiRequest } from "@/lib/api";
import { getMongoClient } from "@/lib/db/client";
import { mergeGuestData } from "@/lib/db/repository";
import type { JournalEntry, MoodLog, StudentProfile } from "@/lib/types";
import { jsonError, jsonOk } from "@/lib/security/response";
import { mergePayloadSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    await guardApiRequest(request);
    const session = await getServerAuthSession();
    if (!session?.user?.id) {
      return jsonError("You must be signed in to merge local data.", 401);
    }

    const client = await getMongoClient();
    if (!client) {
      return jsonError("MongoDB is not configured for account merge.", 503);
    }

    const payload = mergePayloadSchema.parse(await request.json());
    const profile = {
      ...payload.profile,
      id: session.user.id,
      email: session.user.email ?? payload.profile.email,
    } satisfies StudentProfile;

    const snapshot = await mergeGuestData(
      client,
      profile,
      payload.journalEntries as JournalEntry[],
      payload.moodLogs as MoodLog[],
    );

    return jsonOk({
      merged: true,
      snapshot,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to merge guest data.");
  }
}
