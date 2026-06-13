import { NextRequest } from "next/server";

import { guardApiRequest } from "@/lib/api";
import { generateRecoveryPlan } from "@/lib/analytics/engines";
import { loadSnapshot } from "@/lib/data";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { saveRecoveryPlan } from "@/lib/db/repository";
import { jsonError, jsonOk } from "@/lib/security/response";
import { recoveryPlanInputSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const { session, client } = await guardApiRequest(request);
    const payload = recoveryPlanInputSchema.parse(await request.json());
    const snapshot =
      (await loadSnapshot({
        userId: session?.user?.id,
        demoPersona:
          payload.demoPersona ?? request.nextUrl.searchParams.get("demoPersona"),
      })) ?? buildDemoSnapshot(payload.demoPersona ?? undefined);
    const plan = generateRecoveryPlan(snapshot.profile, snapshot.burnoutForecast, snapshot.topTriggers);

    if (client && session?.user?.id) {
      await saveRecoveryPlan(client, {
        ...plan,
        userId: session.user.id,
      });
    }

    return jsonOk(plan);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to generate a recovery plan.");
  }
}
