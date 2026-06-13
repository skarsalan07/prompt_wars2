import { NextRequest } from "next/server";

import { loadSnapshot } from "@/lib/data";
import { buildGuestSnapshot } from "@/lib/guest";
import { assertTrustedOrigin } from "@/lib/security/csrf";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { journalEntryInputSchema, moodLogInputSchema } from "@/lib/validation/schemas";

describe("platform support utilities", () => {
  it("builds a guest snapshot without requiring persistence", () => {
    const snapshot = buildGuestSnapshot("CAT");

    expect(snapshot.profile.examType).toBe("CAT");
    expect(snapshot.burnoutForecast.currentRiskBand).toBe("low");
    expect(snapshot.burnoutForecast.currentScore).toBe(18);
  });

  it("loads demo snapshots directly through the shared loader", async () => {
    const snapshot = await loadSnapshot({ demoPersona: "neet-steady" });

    expect(snapshot?.profile.examType).toBe("NEET");
  });

  it("accepts trusted origins and rejects cross-site writes", () => {
    const validRequest = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        origin: "http://localhost",
        host: "localhost",
      },
    });

    expect(() => assertTrustedOrigin(validRequest)).not.toThrow();

    const invalidRequest = new NextRequest("http://localhost/api/test", {
      method: "POST",
      headers: {
        origin: "http://evil.example",
        host: "localhost",
      },
    });

    expect(() => assertTrustedOrigin(invalidRequest)).toThrow("Cross-site request blocked");
  });

  it("enforces the in-memory rate limit", async () => {
    let lastResult = { allowed: true, remaining: 0 };

    for (let index = 0; index < 31; index += 1) {
      lastResult = await enforceRateLimit("test-key");
    }

    expect(lastResult.allowed).toBe(false);
  });

  it("validates journal and mood payloads", () => {
    expect(
      journalEntryInputSchema.safeParse({
        title: "Reflection",
        reflectionPrompt: "What felt heavy today?",
        text: "Mock test pressure made me compare myself with others and lose sleep.",
        entryDate: "2026-06-13",
        examType: "JEE",
      }).success,
    ).toBe(true);

    expect(
      moodLogInputSchema.safeParse({
        entryDate: "2026-06-13",
        mood: 7,
        stress: 4,
        confidence: 8,
        motivation: 7,
        sleepHours: 7.1,
        studyConsistency: 80,
        goalCompletion: 72,
        eventTags: ["exercise"],
      }).success,
    ).toBe(true);
  });
});
