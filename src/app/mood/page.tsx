"use client";

import { useState } from "react";

import { SectionHeading } from "@/components/layout/section-heading";
import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const EVENT_OPTIONS = [
  "mock-test-tomorrow",
  "mock-test",
  "low-score",
  "exercise",
  "revision-complete",
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function MoodPage() {
  const { addMoodLog, snapshot } = useAppData();
  const [form, setForm] = useState({
    mood: 6,
    stress: 6,
    confidence: 6,
    motivation: 6,
    sleepHours: 6.8,
    studyConsistency: 72,
    goalCompletion: 70,
    eventTags: ["revision-complete"],
    notes: "",
  });

  function updateNumber<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({
      ...current,
      [key]: Number(value),
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <Card className="space-y-5">
        <SectionHeading
          description="Daily mood logs power the emotional heatmap, motivation index, and burnout forecasting engine."
          eyebrow="Mood Tracker"
          title="Log the signals that change pressure over time"
        />
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            addMoodLog({
              ...form,
              entryDate: todayIso(),
            });
          }}
        >
          {[
            ["mood", "Mood"],
            ["stress", "Stress"],
            ["confidence", "Confidence"],
            ["motivation", "Motivation"],
          ].map(([key, label]) => (
            <label className="space-y-2" key={key}>
              <div className="flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
                <span>{label}</span>
                <span>{String(form[key as keyof typeof form])}</span>
              </div>
              <input
                className="w-full accent-[var(--accent-strong)]"
                max="10"
                min="1"
                onChange={(event) => updateNumber(key as keyof typeof form, event.target.value)}
                type="range"
                value={form[key as keyof typeof form] as number}
              />
            </label>
          ))}
          <label className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
              <span>Sleep hours</span>
              <span>{form.sleepHours}</span>
            </div>
            <input
              className="w-full accent-[var(--teal)]"
              max="10"
              min="3"
              onChange={(event) => updateNumber("sleepHours", event.target.value)}
              step="0.1"
              type="range"
              value={form.sleepHours}
            />
          </label>
          <label className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
              <span>Study consistency</span>
              <span>{form.studyConsistency}%</span>
            </div>
            <input
              className="w-full accent-[var(--teal)]"
              max="100"
              min="0"
              onChange={(event) => updateNumber("studyConsistency", event.target.value)}
              type="range"
              value={form.studyConsistency}
            />
          </label>
          <label className="space-y-2">
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--ink)]">
              <span>Goal completion</span>
              <span>{form.goalCompletion}%</span>
            </div>
            <input
              className="w-full accent-[var(--teal)]"
              max="100"
              min="0"
              onChange={(event) => updateNumber("goalCompletion", event.target.value)}
              type="range"
              value={form.goalCompletion}
            />
          </label>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-[var(--ink)]">Event tags</legend>
            <div className="flex flex-wrap gap-2">
              {EVENT_OPTIONS.map((eventTag) => {
                const checked = form.eventTags.includes(eventTag);
                return (
                  <label
                    className={`rounded-full border px-4 py-2 text-sm ${checked ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-black/10 bg-white"}`}
                    key={eventTag}
                  >
                    <input
                      checked={checked}
                      className="sr-only"
                      onChange={() =>
                        setForm((current) => ({
                          ...current,
                          eventTags: checked
                            ? current.eventTags.filter((item) => item !== eventTag)
                            : [...current.eventTags, eventTag],
                        }))
                      }
                      type="checkbox"
                    />
                    {eventTag}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Notes</span>
            <textarea
              className="min-h-28 w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-4"
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              value={form.notes}
            />
          </label>
          <Button type="submit">Save daily signal</Button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <SectionHeading
            description="The forecast updates as soon as new stress, confidence, sleep, and motivation signals come in."
            eyebrow="Forecast"
            title={`${snapshot.burnoutForecast.currentRiskBand.toUpperCase()} burnout risk`}
          />
          <p className="text-5xl font-semibold text-[var(--ink)]">
            {snapshot.burnoutForecast.currentScore}/100
          </p>
          <ul className="grid gap-3">
            {snapshot.burnoutForecast.reasonFactors.map((reason) => (
              <li key={reason} className="rounded-[1rem] bg-[#fff3e8] p-4 text-sm text-[var(--muted)]">
                {reason}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="space-y-4">
          <SectionHeading
            description="This page feeds the emotional heatmap, motivation score, and pattern discovery engine."
            eyebrow="Latest Mood State"
            title="Current emotional posture"
          />
          <p className="text-sm leading-7 text-[var(--muted)]">
            Motivation sits at {snapshot.motivationTrend.at(-1)?.smoothedScore ?? 50}/100 and the strongest upcoming pressure factor is {snapshot.topTriggers[0]?.canonicalLabel ?? "still forming"}.
          </p>
        </Card>
      </div>
    </div>
  );
}
