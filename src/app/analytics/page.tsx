"use client";

import dynamic from "next/dynamic";

import { HeatmapGrid } from "@/components/charts/heatmap-grid";
import { SectionHeading } from "@/components/layout/section-heading";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card } from "@/components/ui/card";

const TriggerImpactChart = dynamic(
  () => import("@/components/charts/trigger-impact-chart").then((module) => module.TriggerImpactChart),
  {
    ssr: false,
    loading: () => <div className="h-72 rounded-[1.5rem] bg-[#fff3e8]" />,
  },
);

export default function AnalyticsPage() {
  const { snapshot } = useAppData();
  const highestStressDay = [...snapshot.heatmap].sort((a, b) => b.stress - a.stress)[0];

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Inspect the signals behind hidden stress discovery, emotional heatmaps, and weekly pattern summaries."
        eyebrow="Analytics"
        title="Emotional trend intelligence over time"
      />

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-4">
          <SectionHeading
            description="These weekly and monthly trigger rankings show which issues appear most often and damage mood the most."
            eyebrow="Top Triggers"
            title="Impact-weighted trigger clustering"
          />
          <TriggerImpactChart data={snapshot.topTriggers.slice(0, 5)} />
          <div className="space-y-3">
            {snapshot.topTriggers.slice(0, 3).map((trigger) => (
              <div key={trigger.canonicalLabel} className="rounded-[1.25rem] bg-[#fffdf9] p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">
                  {trigger.canonicalLabel} · {trigger.frequency} mentions · {trigger.impactScore}/100
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Evidence: {trigger.evidenceSnippets.join(" | ")}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading
            description="Burnout scores remain deterministic so the forecast stays explainable and testable."
            eyebrow="Burnout Forecast"
            title={`${snapshot.burnoutForecast.currentRiskBand.toUpperCase()} risk at ${snapshot.burnoutForecast.currentScore}/100`}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.25rem] bg-[#edf7f5] p-4">
              <p className="text-sm font-semibold text-[var(--ink)]">7-day forecast</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                {snapshot.burnoutForecast.forecast7d.score}/100
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-[#fff3e8] p-4">
              <p className="text-sm font-semibold text-[var(--ink)]">30-day forecast</p>
              <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
                {snapshot.burnoutForecast.forecast30d.score}/100
              </p>
            </div>
          </div>
          <ul className="grid gap-3">
            {snapshot.burnoutForecast.reasonFactors.map((reason) => (
              <li key={reason} className="rounded-[1rem] border border-black/5 bg-white p-4 text-sm text-[var(--muted)]">
                {reason}
              </li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-5">
          <SectionHeading
            description="Daily mood, stress, confidence, and motivation stay visible across the rolling month."
            eyebrow="Emotional Heatmap"
            title="Weekly, monthly, and countdown views"
          />
          <HeatmapGrid cells={snapshot.heatmap} metric="stress" title="Stress intensity" />
          <HeatmapGrid cells={snapshot.heatmap} metric="confidence" title="Confidence levels" />
          <p className="text-sm leading-7 text-[var(--muted)]">
            Highest stress surfaced on {highestStressDay?.date} with stress {highestStressDay?.stress}/10 and confidence {highestStressDay?.confidence}/10.
          </p>
        </Card>

        <Card className="space-y-5">
          <SectionHeading
            description="The weekly synthesis translates repeated event-response loops into clear coaching insights."
            eyebrow="Pattern Discovery"
            title="Recurring emotional relationships"
          />
          <div className="space-y-4">
            {snapshot.patterns.map((pattern) => (
              <div key={pattern.id} className="rounded-[1.25rem] bg-[#f7fbfb] p-4">
                <p className="text-sm font-semibold text-[var(--ink)]">{pattern.title}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{pattern.summary}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--slate)]">
                  Confidence: {Math.round(pattern.confidence * 100)}%
                </p>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
