import type { AIProvider, AIResponseMeta } from "@/lib/types";

type JSONResponse<T> = {
  schemaName: string;
  prompt: string;
  fallback: T;
};

export type AIJsonResult<T> = {
  output: T;
  meta: AIResponseMeta;
};

export interface AIAdapter {
  generateJson<T>(request: JSONResponse<T>): Promise<AIJsonResult<T>>;
}

export function buildFallbackMeta(
  provider: AIProvider,
  model: string,
  reason: string,
): AIResponseMeta {
  return {
    provider,
    model,
    usedLiveModel: false,
    mode: "fallback",
    reason,
  };
}

export function buildLiveMeta(provider: AIProvider, model: string): AIResponseMeta {
  return {
    provider,
    model,
    usedLiveModel: true,
    mode: "live",
  };
}

export function extractJson<T>(payload: string) {
  const cleaned = payload.trim().replace(/^```json/, "").replace(/```$/, "");
  try {
    return {
      parsed: true,
      value: JSON.parse(cleaned) as T,
    };
  } catch {
    return {
      parsed: false,
      value: null,
    };
  }
}
