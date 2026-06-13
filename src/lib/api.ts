import { NextRequest } from "next/server";

import { getServerAuthSession } from "@/auth";
import { loadSnapshot } from "@/lib/data";
import { getMongoClient } from "@/lib/db/client";
import { assertTrustedOrigin } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";

export async function guardApiRequest(request: NextRequest) {
  assertTrustedOrigin(request);

  const session = await getServerAuthSession();
  const client = await getMongoClient();
  const requesterId = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${requesterId}:${request.nextUrl.pathname}`;
  const rate = await enforceRateLimit(key, client ?? undefined);

  if (!rate.allowed) {
    throw new Error("Too many requests. Please wait a minute and try again.");
  }

  return {
    session,
    client,
  };
}

export async function loadRouteSnapshot(request: NextRequest) {
  const session = await getServerAuthSession();
  const demoPersona = request.nextUrl.searchParams.get("demoPersona");

  return loadSnapshot({
    userId: session?.user?.id,
    demoPersona,
  });
}
