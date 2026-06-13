const INJECTION_PATTERNS = [
  /ignore previous/i,
  /system prompt/i,
  /developer instructions/i,
  /reveal hidden/i,
  /act as/i,
  /override/i,
  /jailbreak/i,
];

export function sanitizePromptInput(value: string) {
  return value
    .replace(/[<>{}]/g, "")
    .replace(/\b(api[_ -]?key|password|token)\b/gi, "[redacted]")
    .trim();
}

export function detectPromptInjection(value: string) {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(value));
}
