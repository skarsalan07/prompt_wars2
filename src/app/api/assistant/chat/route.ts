import { NextRequest } from "next/server";

import { getServerAuthSession } from "@/auth";
import { generateCoachReply } from "@/lib/ai/service";
import { loadSnapshot } from "@/lib/data";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { detectPromptInjection, sanitizePromptInput } from "@/lib/security/prompt-guard";
import { jsonError, jsonOk } from "@/lib/security/response";
import { assistantChatSchema } from "@/lib/validation/schemas";
import { guardApiRequest } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    await guardApiRequest(request);
    const payload = assistantChatSchema.parse(await request.json());
    const cleanedMessage = sanitizePromptInput(payload.message);

    if (detectPromptInjection(cleanedMessage)) {
      return jsonError("The coach only accepts wellness reflections and support requests.", 400);
    }

    const session = await getServerAuthSession();
    const snapshot =
      (await loadSnapshot({
        userId: session?.user?.id,
        demoPersona: payload.demoPersona,
      })) ?? buildDemoSnapshot();

    const response = await generateCoachReply(snapshot, cleanedMessage);
    return jsonOk(response);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to generate coaching response.");
  }
}
