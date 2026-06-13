"use client";

import { useState } from "react";

import { SectionHeading } from "@/components/layout/section-heading";
import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CoachResponse } from "@/lib/types";

export default function AssistantPage() {
  const { askCoach, snapshot } = useAppData();
  const [message, setMessage] = useState(snapshot.activeCoachPrompt);
  const [response, setResponse] = useState<CoachResponse | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
      <Card className="space-y-5">
        <SectionHeading
          description="The AI coach uses exam type, preparation stage, trigger history, emotional patterns, and memory summaries to avoid generic advice."
          eyebrow="Exam-Specific Coach"
          title="Conversational support that remembers what matters"
        />
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            const next = await askCoach(message);
            setResponse(next);
            setLoading(false);
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Ask the coach</span>
            <textarea
              className="min-h-64 w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-4"
              onChange={(event) => setMessage(event.target.value)}
              value={message}
            />
          </label>
          <Button type="submit">{loading ? "Coaching..." : "Generate personalized support"}</Button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <SectionHeading
            description="Responses are grounded in deterministic analytics and only personalized by the model."
            eyebrow="Coach Response"
            title="Personalized support"
          />
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-[#edf7f5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">
              {response?.meta?.usedLiveModel ? "Live AI" : "Fallback"}
            </span>
            <span className="inline-flex items-center rounded-full bg-[#fff3e8] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">
              {response?.meta?.provider ?? "local"}
            </span>
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--slate)]">
              {response?.meta?.model ?? "deterministic-fallback"}
            </span>
          </div>
          <p className="text-sm leading-7 text-[var(--muted)]">
            {response?.reply ??
              `${snapshot.profile.name.split(" ")[0]}, your current coaching focus is ${snapshot.recoveryPlan.focusArea.toLowerCase()} with ${snapshot.burnoutForecast.currentRiskBand} burnout risk.`}
          </p>
          <p className="text-xs leading-6 text-[var(--muted)]">
            {response?.meta?.reason ?? "Judge Demo mode uses the server AI route when an API key is configured."}
          </p>
          <div className="grid gap-3">
            {(response?.recommendedExercises ?? [
              "Use one short breathing reset before your hardest subject.",
              "Anchor tonight with a proof-of-progress note.",
            ]).map((exercise) => (
              <div key={exercise} className="rounded-[1rem] bg-[#edf7f5] p-4 text-sm text-[var(--slate)]">
                {exercise}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading
            description="The follow-up prompts deepen the journaling loop and improve trigger discovery quality."
            eyebrow="Suggested Prompts"
            title="Next reflections to unlock better insight"
          />
          <ul className="grid gap-3">
            {(response?.suggestedPrompts ?? [
              "What has felt heavier than usual this week?",
              "Which subject currently needs confidence, not more pressure?",
              "What small action made stress easier to carry recently?",
            ]).map((prompt) => (
              <li key={prompt} className="rounded-[1rem] border border-black/5 bg-white p-4 text-sm text-[var(--muted)]">
                {prompt}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
