import { NextRequest } from "next/server";

import { loadRouteSnapshot } from "@/lib/api";
import { buildDemoSnapshot } from "@/lib/demo/seed";
import { jsonOk } from "@/lib/security/response";

export async function GET(request: NextRequest) {
  const snapshot = (await loadRouteSnapshot(request)) ?? buildDemoSnapshot();

  return jsonOk({
    topTriggers: snapshot.topTriggers.slice(0, 5),
  });
}
