import { NextRequest } from "next/server";

import { guardApiRequest, loadRouteSnapshot } from "@/lib/api";
import { analyzeEntryWithInsightPipeline } from "@/lib/ai/entry-analysis";
import { saveJournalEntry } from "@/lib/db/repository";
import { buildGuestSnapshot } from "@/lib/guest";
import { encryptText } from "@/lib/security/encryption";
import { detectPromptInjection, sanitizePromptInput } from "@/lib/security/prompt-guard";
import { jsonError, jsonOk } from "@/lib/security/response";
import { journalEntryInputSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const { session, client } = await guardApiRequest(request);
    const payload = journalEntryInputSchema.parse(await request.json());
    const cleanedText = sanitizePromptInput(payload.text);

    if (detectPromptInjection(cleanedText)) {
      return jsonError("Journal text contained prompt-injection-like instructions and was rejected.", 400);
    }

    const baseSnapshot =
      (await loadRouteSnapshot(request)) ?? buildGuestSnapshot(payload.examType);
    const { analysis, entry, meta } = await analyzeEntryWithInsightPipeline({
      snapshot: baseSnapshot,
      text: cleanedText,
      entryDate: payload.entryDate,
      title: payload.title,
      reflectionPrompt: payload.reflectionPrompt,
      userId: session?.user?.id ?? "guest-user",
    });

    if (client && session?.user?.id) {
      await saveJournalEntry(client, {
        ...entry,
        userId: session.user.id,
        encryptedText: encryptText(cleanedText),
        plainText: undefined,
      });
    }

    return jsonOk({
      entry: {
        ...entry,
        plainText: undefined,
      },
      analysis,
      meta,
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to analyze journal entry.");
  }
}
