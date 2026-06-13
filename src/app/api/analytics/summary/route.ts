import { NextRequest } from "next/server";

import { buildDailyInsights } from "@/lib/analytics/engines";
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
    daily: buildDailyInsights(snapshot.moodLogs, snapshot.burnoutForecast).slice(-14),
    weekly: {
      topTriggers: snapshot.topTriggers.slice(0, 3),
      motivationTrend: snapshot.motivationTrend.slice(-7),
      patterns: snapshot.patterns.slice(0, 3),
      burnoutForecast: snapshot.burnoutForecast,
    },
    monthly: {
      topTriggers: snapshot.topTriggers.slice(0, 5),
      motivationTrend: snapshot.motivationTrend,
      heatmap: snapshot.heatmap,
      burnoutForecast: snapshot.burnoutForecast,
    },
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
