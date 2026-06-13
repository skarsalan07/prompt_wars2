import { NextRequest } from "next/server";

vi.mock("@/auth", () => ({
  getServerAuthSession: vi.fn(async () => null),
}));

import { GET as getBurnoutForecast } from "@/app/api/forecast/burnout/route";
import { GET as getDemoBootstrap } from "@/app/api/demo/bootstrap/route";

describe("API routes", () => {
  it("returns judge demo bootstrap data", async () => {
    const request = new NextRequest("http://localhost/api/demo/bootstrap?persona=neet-steady");
    const response = await getDemoBootstrap(request);
    const data = await response.json();

    expect(data.snapshot.profile.examType).toBe("NEET");
    expect(data.snapshot.topTriggers.length).toBeGreaterThan(0);
  });

  it("returns burnout forecast for a demo persona", async () => {
    const request = new NextRequest("http://localhost/api/forecast/burnout?demoPersona=upsc-marathon");
    const response = await getBurnoutForecast(request);
    const data = await response.json();

    expect(data.currentScore).toBeGreaterThanOrEqual(0);
    expect(["low", "medium", "high"]).toContain(data.currentRiskBand);
  });
});
