import { buildDemoSnapshot } from "@/lib/demo/seed";
import { getMongoClient } from "@/lib/db/client";
import { getUserSnapshot } from "@/lib/db/repository";
import type { DemoSnapshot } from "@/lib/types";

export async function loadSnapshot(options: {
  userId?: string | null;
  demoPersona?: string | null;
}): Promise<DemoSnapshot | null> {
  if (options.demoPersona) {
    return buildDemoSnapshot(options.demoPersona);
  }

  if (!options.userId) {
    return null;
  }

  const client = await getMongoClient();
  if (!client) {
    return null;
  }

  return getUserSnapshot(client, options.userId);
}
