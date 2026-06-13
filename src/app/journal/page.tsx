"use client";

import { useState } from "react";

import { SectionHeading } from "@/components/layout/section-heading";
import { useAppData } from "@/components/providers/app-data-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { JournalAnalysisResponse } from "@/lib/types";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function JournalPage() {
  const { addJournalEntry, snapshot } = useAppData();
  const [title, setTitle] = useState("Daily reflection");
  const [prompt, setPrompt] = useState("What felt heavy today and what helped even a little?");
  const [text, setText] = useState("");
  const [result, setResult] = useState<JournalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="space-y-5">
        <SectionHeading
          description="Capture journaling entries, stress thoughts, and study reflections. The system turns them into trigger clusters, anxiety indicators, and coping recommendations."
          eyebrow="Journal Interface"
          title="Private reflection with AI pattern discovery"
        />
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            if (!text.trim()) {
              return;
            }

            setLoading(true);
            const nextResult = await addJournalEntry({
              title,
              reflectionPrompt: prompt,
              text,
              entryDate: todayIso(),
            });
            setResult(nextResult);
            setText("");
            setLoading(false);
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Entry title</span>
            <input
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Reflection prompt</span>
            <input
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) => setPrompt(event.target.value)}
              value={prompt}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Student reflection</span>
            <textarea
              className="min-h-64 w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-4"
              onChange={(event) => setText(event.target.value)}
              placeholder="Write about your stress, confidence, sleep, mock tests, pressure, or anything that felt emotionally important."
              value={text}
            />
          </label>
          <Button type="submit">{loading ? "Analyzing..." : "Analyze reflection"}</Button>
        </form>
      </Card>

      <div className="space-y-6">
        <Card className="space-y-4">
          <SectionHeading
            description="Every analysis shows whether the result came from a live model or the deterministic fallback path."
            eyebrow="AI Analysis Status"
            title={
              result?.meta.usedLiveModel
                ? `Live ${result.meta.provider.toUpperCase()} analysis`
                : "Fallback analysis"
            }
          />
          <div className="flex flex-wrap gap-2">
            <Badge>{result?.meta.provider ?? "local"}</Badge>
            <Badge>{result?.meta.model ?? "deterministic-fallback"}</Badge>
            <Badge>{result?.meta.mode ?? "fallback"}</Badge>
          </div>
          <p className="text-sm leading-7 text-[var(--muted)]">
            {result?.meta.reason ??
              "Submit a reflection in Judge Demo mode with a configured API key to force a live Groq or Gemini call."}
          </p>
          <div className="grid gap-3">
            {(result?.analysis.recommendedActions ?? snapshot.recoveryPlan.tasks.slice(0, 3).map((task) => task.description)).map((action) => (
              <div key={action} className="rounded-[1rem] bg-[#edf7f5] p-4 text-sm text-[var(--slate)]">
                {action}
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading
            description="Recent entries become evidence for hidden stress triggers and emotional trend analysis."
            eyebrow="Latest Insights"
            title="What the engine is noticing"
          />
          <div className="space-y-4">
            {snapshot.journalEntries.slice(-3).reverse().map((entry, index) => (
              <div key={`${entry.id}-${index}`} className="rounded-[1.25rem] bg-[#fffdf9] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--ink)]">{entry.title}</p>
                  <Badge>{entry.entryDate}</Badge>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{entry.textPreview}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.triggerMentions.map((trigger) => (
                    <Badge key={`${entry.id}-${trigger.id}`}>{trigger.canonicalLabel}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <SectionHeading
            description="Safety and support remain visible without turning the experience into a clinical product."
            eyebrow="Support Layer"
            title="Crisis-aware journaling"
          />
          <p className="text-sm leading-7 text-[var(--muted)]">
            {snapshot.journalEntries.at(-1)?.safetyFlag.supportMessage}
          </p>
        </Card>
      </div>
    </div>
  );
}
