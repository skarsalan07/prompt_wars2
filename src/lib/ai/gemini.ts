import {
  buildFallbackMeta,
  buildLiveMeta,
  extractJson,
  type AIAdapter,
} from "@/lib/ai/provider";

export class GeminiAdapter implements AIAdapter {
  async generateJson<T>({
    schemaName,
    prompt,
    fallback,
  }: {
    schemaName: string;
    prompt: string;
    fallback: T;
  }) {
    const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        output: fallback,
        meta: buildFallbackMeta("gemini", model, "Missing GEMINI_API_KEY."),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Return strict JSON for schema ${schemaName}.\n${prompt}`,
                },
              ],
            },
          ],
        }),
      },
    ).catch(() => null);

    if (!response?.ok) {
      return {
        output: fallback,
        meta: buildFallbackMeta("gemini", model, "Gemini request failed or returned a non-200 response."),
      };
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = extractJson<T>(content);

    if (!parsed.parsed || parsed.value === null) {
      return {
        output: fallback,
        meta: buildFallbackMeta("gemini", model, "Gemini returned malformed JSON."),
      };
    }

    return {
      output: parsed.value,
      meta: buildLiveMeta("gemini", model),
    };
  }
}
