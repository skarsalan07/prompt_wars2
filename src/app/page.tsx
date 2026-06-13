"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AlertTriangle, BrainCircuit, Flame, HeartPulse, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/layout/section-heading";
import { useAppData } from "@/components/providers/app-data-provider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils";

const MotivationTrendChart = dynamic(
  () => import("@/components/charts/motivation-trend-chart").then((module) => module.MotivationTrendChart),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-[1.5rem] bg-[#f7fbfb]" />,
  },
);

const TriggerImpactChart = dynamic(
  () => import("@/components/charts/trigger-impact-chart").then((module) => module.TriggerImpactChart),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-[1.5rem] bg-[#fff3e8]" />,
  },
);

export default function Home() {
  const { snapshot, mode } = useAppData();
  const topTrigger = snapshot.topTriggers[0];
  const latestMotivation = snapshot.motivationTrend.at(-1);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.9fr]">
        <Card className="overflow-hidden bg-[linear-gradient(140deg,rgba(255,255,255,0.95),rgba(255,250,244,0.92))]">
          <div className="grid gap-6 md:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-4">
              <Badge>{mode === "demo" ? "Judge Demo Mode" : "Private Workspace"}</Badge>
              <div className="space-y-3">
                <h2 className="max-w-3xl text-4xl leading-tight text-[var(--ink)] md:text-5xl">
                  This is not a mood tracker. It is a mental wellness intelligence layer for exam pressure.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-[var(--muted)]">
                  The platform surfaces hidden trigger clusters, predicts burnout before collapse, and turns emotional patterns into exam-specific recovery guidance.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link className="rounded-full bg-[var(--ink)] px-5 py-3 text-sm font-semibold text-white" href="/analytics">
                  Explore analytics
                </Link>
                <Link className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-[var(--ink)]" href="/assistant">
                  Open AI coach
                </Link>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] bg-[#fff3e8] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slate)]">
                  Top Trigger
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  {topTrigger?.canonicalLabel ?? "No dominant trigger yet"}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {topTrigger?.frequency ?? 0} mentions with an impact score of {topTrigger?.impactScore ?? 0}/100.
                </p>
              </div>
              <div className="rounded-[1.5rem] bg-[#edf7f5] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slate)]">
                  Burnout Forecast
                </p>
                <p className="mt-2 text-2xl font-semibold text-[var(--ink)]">
                  {snapshot.burnoutForecast.currentRiskBand.toUpperCase()} · {snapshot.burnoutForecast.currentScore}/100
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  7-day forecast: {formatPercent(snapshot.burnoutForecast.forecast7d.probability)} | 30-day forecast: {formatPercent(snapshot.burnoutForecast.forecast30d.probability)}
                </p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="space-y-5">
          <SectionHeading
            description="These are the signals the system keeps learning from every reflection, mood log, and recovery checkpoint."
            eyebrow="Why this wins"
            title="Explainable wellness intelligence"
          />
          <div className="grid gap-3">
            {[
              {
                icon: Flame,
                label: "Burnout forecast",
                value: `${snapshot.burnoutForecast.forecast7d.riskBand} in 7 days`,
              },
              {
                icon: HeartPulse,
                label: "Motivation index",
                value: `${latestMotivation?.smoothedScore ?? 50}/100`,
              },
              {
                icon: BrainCircuit,
                label: "Pattern memory",
                value: snapshot.memorySummary.noteForCoach,
              },
              {
                icon: Sparkles,
                label: "Exam coach",
                value: `${snapshot.profile.examType}-specific and personalized`,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-[1.25rem] border border-black/5 bg-[#fffdf9] p-4">
                <item.icon className="mt-1 h-5 w-5 text-[var(--accent-strong)]" />
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{item.label}</p>
                  <p className="text-sm leading-6 text-[var(--muted)]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-4">
        {[
          {
            label: "Current burnout risk",
            value: `${snapshot.burnoutForecast.currentScore}/100`,
            note: snapshot.burnoutForecast.reasonFactors[0] ?? "Risk is stabilizing with better recovery coverage.",
          },
          {
            label: "Motivation index",
            value: `${latestMotivation?.smoothedScore ?? 50}/100`,
            note: "Built from positivity, goals, mood stability, and study consistency.",
          },
          {
            label: "Weekly trigger count",
            value: `${snapshot.topTriggers.reduce((sum, trigger) => sum + trigger.frequency, 0)}`,
            note: "Recurring emotional load is clustered instead of treated as isolated bad days.",
          },
          {
            label: "Safety posture",
            value: snapshot.journalEntries.at(-1)?.safetyFlag.level.toUpperCase() ?? "NONE",
            note: "Crisis-risk language is flagged instantly with supportive non-clinical guidance.",
          },
        ].map((card) => (
          <Card key={card.label} className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">{card.label}</p>
            <p className="text-3xl font-semibold text-[var(--ink)]">{card.value}</p>
            <p className="text-sm leading-6 text-[var(--muted)]">{card.note}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_1fr]">
        <Card className="space-y-4">
          <SectionHeading
            description="The score smooths day-to-day noise and makes motivation drift visible before it turns into disengagement."
            eyebrow="Motivation Index"
            title="0–100 motivation momentum"
          />
          <MotivationTrendChart data={snapshot.motivationTrend.slice(-14)} />
        </Card>
        <Card className="space-y-4">
          <SectionHeading
            description="Impact score combines frequency, stress correlation, confidence drop, and sleep deficit across the rolling window."
            eyebrow="Trigger Discovery"
            title="Hidden stress trigger ranking"
          />
          <TriggerImpactChart data={snapshot.topTriggers.slice(0, 5)} />
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-4">
          <SectionHeading
            description="Weekly pattern synthesis turns repeated emotional cycles into one actionable insight."
            eyebrow="Pattern Discovery"
            title={snapshot.patterns[0]?.title ?? "Pattern still emerging"}
          />
          <p className="text-base leading-8 text-[var(--muted)]">
            {snapshot.patterns[0]?.summary}
          </p>
          <ul className="grid gap-3">
            {snapshot.patterns[0]?.evidenceSnippets.map((snippet) => (
              <li key={snippet} className="rounded-[1.25rem] bg-[#f7fbfb] p-4 text-sm text-[var(--slate)]">
                {snippet}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-4">
          <SectionHeading
            description="Recovery plans adapt to exam type, burnout level, and the trigger that is doing the most damage."
            eyebrow="Active Recovery Plan"
            title={snapshot.recoveryPlan.focusArea}
          />
          <div className="space-y-3">
            {snapshot.recoveryPlan.tasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex gap-3 rounded-[1.25rem] border border-black/5 bg-[#fffdf9] p-4">
                <div
                  aria-hidden
                  className={`mt-1 h-3 w-3 rounded-full ${task.done ? "bg-[var(--teal)]" : "bg-[var(--accent)]"}`}
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{task.title}</p>
                  <p className="text-sm leading-6 text-[var(--muted)]">{task.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4">
          <SectionHeading
            description="The coach remembers what tends to hurt, what has helped, and how confidence behaves across the exam journey."
            eyebrow="Longitudinal Memory"
            title="Memory-aware coaching context"
          />
          <div className="space-y-3">
            <p className="text-sm leading-7 text-[var(--muted)]">{snapshot.memorySummary.noteForCoach}</p>
            <div className="flex flex-wrap gap-2">
              {snapshot.memorySummary.topTriggers.map((trigger) => (
                <Badge key={trigger}>{trigger}</Badge>
              ))}
            </div>
          </div>
        </Card>
        <Card className="space-y-4">
          <SectionHeading
            description="Support remains non-clinical, accessible, and gently urgent when risk language appears."
            eyebrow="Safety"
            title="Crisis-aware without overreach"
          />
          <div className="flex items-start gap-3 rounded-[1.5rem] bg-[#fff2ef] p-5">
            <AlertTriangle className="mt-1 h-5 w-5 text-[var(--danger)]" />
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[var(--ink)]">
                {snapshot.journalEntries.at(-1)?.safetyFlag.reason}
              </p>
              <p className="text-sm leading-6 text-[var(--muted)]">
                {snapshot.journalEntries.at(-1)?.safetyFlag.supportMessage}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
