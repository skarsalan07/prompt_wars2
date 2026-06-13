import { NextRequest } from "next/server";

export function assertTrustedOrigin(request: NextRequest) {
  if (request.method === "GET") {
    return;
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    throw new Error("Missing origin headers");
  }

  const trustedOrigin = new URL(origin);
  if (trustedOrigin.host !== host) {
    throw new Error("Cross-site request blocked");
  }
}
