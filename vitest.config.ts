import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: [
        "src/lib/analytics/**/*.ts",
        "src/lib/ai/prompts.ts",
        "src/lib/ai/service.ts",
        "src/lib/demo/**/*.ts",
        "src/lib/security/**/*.ts",
        "src/lib/guest.ts",
        "src/lib/validation/schemas.ts",
        "src/app/api/analytics/**/*.ts",
        "src/app/api/assistant/chat/route.ts",
        "src/app/api/demo/bootstrap/route.ts",
        "src/app/api/forecast/burnout/route.ts",
        "src/app/api/insights/patterns/route.ts",
        "src/app/api/journal-entries/route.ts",
        "src/app/api/mood-logs/route.ts",
        "src/app/api/recovery-plans/generate/route.ts",
        "src/app/api/triggers/summary/route.ts",
      ],
      exclude: [
        "src/lib/db/**",
        "src/app/api/auth/**",
        "src/app/api/account/merge/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
