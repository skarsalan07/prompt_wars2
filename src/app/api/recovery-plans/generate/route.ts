import { NextRequest } from "next/server";

import { guardApiRequest, loadRouteSnapshot } from "@/lib/api";
import { generateRecoveryPlan } from "@/lib/analytics/engines";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { saveRecoveryPlan } from "@/lib/db/repository";
import { jsonError, jsonOk } from "@/lib/security/response";

export async function POST(request: NextRequest) {
  try {
    const { session, client } = await guardApiRequest(request);
    const snapshot = (await loadRouteSnapshot(request)) ?? buildDemoSnapshot();
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
