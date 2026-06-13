"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppData } from "@/components/providers/app-data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/journal", label: "Journal" },
  { href: "/mood", label: "Mood" },
  { href: "/analytics", label: "Analytics" },
  { href: "/assistant", label: "Coach" },
  { href: "/recovery", label: "Recovery" },
  { href: "/onboarding", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { mode, setMode, snapshot, demoPersonas, selectDemoPersona } = useAppData();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(244,162,97,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(42,157,143,0.22),_transparent_22%),linear-gradient(180deg,_#fef8f1_0%,_#fffdf8_48%,_#f8fbfc_100%)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>
      <header className="border-b border-black/5 bg-white/75 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Badge>Mental Wellness Intelligence Platform</Badge>
              <div>
                <h1 className="font-serif text-3xl leading-none text-[var(--ink)] md:text-4xl">
                  Exam stress intelligence built for high-stakes preparation.
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)] md:text-base">
                  Discover hidden stress triggers, forecast burnout early, and deliver exam-specific recovery coaching.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className={cn(
                  mode === "demo" ? "" : "bg-white text-[var(--ink)] ring-1 ring-black/10 hover:bg-white",
                )}
                onClick={() => setMode("demo")}
                type="button"
              >
                Judge Demo
              </Button>
              <Button
                className={cn(
                  mode === "guest"
                    ? ""
                    : "bg-white text-[var(--ink)] ring-1 ring-black/10 hover:bg-white",
                )}
                onClick={() => setMode("guest")}
                type="button"
              >
                Your Workspace
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <nav aria-label="Primary" className="flex flex-wrap gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    pathname === item.href
                      ? "bg-[var(--ink)] text-white"
                      : "text-[var(--slate)] hover:bg-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--slate)]">
              <label className="font-medium" htmlFor="persona-select">
                Demo persona
              </label>
              <select
                id="persona-select"
                className="rounded-full border border-black/10 bg-white px-4 py-2"
                disabled={mode !== "demo"}
                onChange={(event) => selectDemoPersona(event.target.value)}
                value={snapshot.profile.demoPersona ?? demoPersonas[0]?.id}
              >
                {demoPersonas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name} · {persona.examType}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>
      <main id="main-content" className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
