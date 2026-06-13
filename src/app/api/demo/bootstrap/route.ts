import { NextRequest } from "next/server";

import { buildDemoSnapshot, listDemoPersonas } from "@/lib/demo/seed";
import { jsonOk } from "@/lib/security/response";

export async function GET(request: NextRequest) {
  const demoPersona = request.nextUrl.searchParams.get("persona") ?? "jee-precision";

  return jsonOk({
    personas: listDemoPersonas(),
    snapshot: buildDemoSnapshot(demoPersona),
  });
}
