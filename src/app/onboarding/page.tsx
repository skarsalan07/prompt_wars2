"use client";

import { useState } from "react";

import { SectionHeading } from "@/components/layout/section-heading";
import { useAppData } from "@/components/providers/app-data-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EXAM_TYPES, PREPARATION_STAGES } from "@/lib/types";

export default function OnboardingPage() {
  const { snapshot, updateProfile } = useAppData();
  const [form, setForm] = useState({
    name: snapshot.profile.name,
    examType: snapshot.profile.examType,
    preparationStage: snapshot.profile.preparationStage,
    targetExamDate: snapshot.profile.targetExamDate,
    focusSubjects: snapshot.profile.focusSubjects.join(", "),
    mockScoreContext: snapshot.profile.mockScoreContext ?? "",
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card className="space-y-5">
        <SectionHeading
          description="Exam type, study stage, and timeline control how the coach phrases support and how recovery plans are generated."
          eyebrow="Onboarding"
          title="Personalize the intelligence layer"
        />
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            updateProfile({
              name: form.name,
              examType: form.examType,
              preparationStage: form.preparationStage,
              targetExamDate: form.targetExamDate,
              focusSubjects: form.focusSubjects
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
              mockScoreContext: form.mockScoreContext,
            });
          }}
        >
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Name</span>
            <input
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              value={form.name}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Exam type</span>
            <select
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) =>
                setForm((current) => ({ ...current, examType: event.target.value as typeof current.examType }))
              }
              value={form.examType}
            >
              {EXAM_TYPES.map((examType) => (
                <option key={examType} value={examType}>
                  {examType}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Preparation stage</span>
            <select
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  preparationStage: event.target.value as typeof current.preparationStage,
                }))
              }
              value={form.preparationStage}
            >
              {PREPARATION_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Target exam date</span>
            <input
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) => setForm((current) => ({ ...current, targetExamDate: event.target.value }))}
              type="date"
              value={form.targetExamDate}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Focus subjects</span>
            <input
              className="w-full rounded-[1.25rem] border border-black/10 bg-white px-4 py-3"
              onChange={(event) => setForm((current) => ({ ...current, focusSubjects: event.target.value }))}
              placeholder="Physics, Mathematics"
              value={form.focusSubjects}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-semibold text-[var(--ink)]">Recent mock score context</span>
            <textarea
              className="min-h-32 w-full rounded-[1.5rem] border border-black/10 bg-white px-4 py-4"
              onChange={(event) => setForm((current) => ({ ...current, mockScoreContext: event.target.value }))}
              value={form.mockScoreContext}
            />
          </label>
          <Button type="submit">Save personalization</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <SectionHeading
          description="These fields directly influence trigger interpretation, recovery plans, and the language of the AI coach."
          eyebrow="Current Profile"
          title="What the system knows right now"
        />
        <dl className="grid gap-4">
          {[
            ["Name", snapshot.profile.name],
            ["Exam", snapshot.profile.examType],
            ["Stage", snapshot.profile.preparationStage],
            ["Target date", snapshot.profile.targetExamDate],
            ["Subjects", snapshot.profile.focusSubjects.join(", ") || "Not set"],
          ].map(([term, value]) => (
            <div key={term} className="rounded-[1rem] bg-[#fffdf9] p-4">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--slate)]">
                {term}
              </dt>
              <dd className="mt-2 text-sm text-[var(--muted)]">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
