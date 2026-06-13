import { NextRequest } from "next/server";

import { loadRouteSnapshot } from "@/lib/api";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { jsonOk } from "@/lib/security/response";

export async function GET(request: NextRequest) {
  const snapshot = (await loadRouteSnapshot(request)) ?? buildDemoSnapshot();
  const latestMotivation = snapshot.motivationTrend.at(-1);
  const previousWeek = snapshot.motivationTrend.at(-8);

  return jsonOk({
    profile: snapshot.profile,
    topTriggers: snapshot.topTriggers.slice(0, 5),
    burnoutForecast: snapshot.burnoutForecast,
    motivation: {
      current: latestMotivation?.smoothedScore ?? 50,
      deltaVsPreviousWeek:
        (latestMotivation?.smoothedScore ?? 50) - (previousWeek?.smoothedScore ?? 50),
    },
    activePattern: snapshot.patterns[0],
    activePlan: snapshot.recoveryPlan,
    memorySummary: snapshot.memorySummary,
  });
}
