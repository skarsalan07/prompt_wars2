import { NextRequest } from "next/server";

import { loadRouteSnapshot } from "@/lib/api";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { jsonOk } from "@/lib/security/response";

export async function GET(request: NextRequest) {
  const snapshot = (await loadRouteSnapshot(request)) ?? buildDemoSnapshot();
  const strongestDrop = [...snapshot.heatmap].sort((a, b) => b.stress - a.stress)[0];

  return jsonOk({
    heatmap: snapshot.heatmap,
    summary: strongestDrop
      ? `Highest stress surfaced on ${strongestDrop.date} with stress ${strongestDrop.stress}/10 and confidence ${strongestDrop.confidence}/10.`
      : "Keep logging daily to unlock a richer heatmap summary.",
  });
}
