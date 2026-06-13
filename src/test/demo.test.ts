import { buildDemoSnapshot, listDemoPersonas } from "@/lib/demo/seed";

describe("demo seed", () => {
  it("builds a rich demo snapshot with 45 days of history", () => {
    const snapshot = buildDemoSnapshot("jee-precision");

    expect(snapshot.profile.demoPersona).toBe("jee-precision");
    expect(snapshot.journalEntries).toHaveLength(45);
    expect(snapshot.moodLogs).toHaveLength(45);
    expect(snapshot.topTriggers.length).toBeGreaterThan(0);
    expect(snapshot.patterns.length).toBeGreaterThan(0);
  });

  it("lists the required judge personas", () => {
    const personas = listDemoPersonas();
    expect(personas.map((persona) => persona.examType)).toEqual(["JEE", "NEET", "UPSC"]);
  });
});
