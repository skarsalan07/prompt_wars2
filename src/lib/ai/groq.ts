import {
  buildFallbackMeta,
  buildLiveMeta,
  extractJson,
  type AIAdapter,
} from "@/lib/ai/provider";

export class GroqAdapter implements AIAdapter {
  async generateJson<T>({
    schemaName,
    prompt,
    fallback,
  }: {
    schemaName: string;
    prompt: string;
    fallback: T;
  }) {
    const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        output: fallback,
        meta: buildFallbackMeta("groq", model, "Missing GROQ_API_KEY."),
      };
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content: `Return strict JSON for schema ${schemaName}.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    }).catch(() => null);

    if (!response?.ok) {
      return {
        output: fallback,
        meta: buildFallbackMeta("groq", model, "Groq request failed or returned a non-200 response."),
      };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson<T>(content);

    if (!parsed.parsed || parsed.value === null) {
      return {
        output: fallback,
        meta: buildFallbackMeta("groq", model, "Groq returned malformed JSON."),
      };
    }

    return {
      output: parsed.value,
      meta: buildLiveMeta("groq", model),
    };
  }
}
