"use client";

import { SectionHeading } from "@/components/layout/section-heading";
import { useAppData } from "@/components/providers/app-data-provider";
import { Card } from "@/components/ui/card";

export default function RecoveryPage() {
  const { snapshot, toggleRecoveryTask } = useAppData();

  return (
    <div className="space-y-6">
      <SectionHeading
        description="Recovery plans automatically activate when burnout rises, motivation falls, or anxiety stays elevated."
        eyebrow="Recovery Plan"
        title={`${snapshot.recoveryPlan.durationDays}-day ${snapshot.profile.examType} reset plan`}
      />
      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <Card className="space-y-4">
          <p className="text-lg font-semibold text-[var(--ink)]">{snapshot.recoveryPlan.triggerReason}</p>
          <div className="grid gap-4">
            {snapshot.recoveryPlan.tasks.map((task) => (
              <label
                className="flex cursor-pointer gap-4 rounded-[1.25rem] border border-black/5 bg-[#fffdf9] p-4"
                key={task.id}
              >
                <input
                  checked={task.done}
                  className="mt-1 h-5 w-5 accent-[var(--teal)]"
                  onChange={() => toggleRecoveryTask(task.id)}
                  type="checkbox"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--ink)]">{task.title}</p>
                  <p className="text-sm leading-6 text-[var(--muted)]">{task.description}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>
        <Card className="space-y-4">
          <SectionHeading
            description="Checkpoints keep the plan grounded in tiny recoverable actions, not guilt-driven overcorrection."
            eyebrow="Checkpoints"
            title="Daily recovery rhythm"
          />
          <ul className="grid gap-3">
            {snapshot.recoveryPlan.checkpoints.map((checkpoint) => (
              <li key={checkpoint} className="rounded-[1rem] bg-[#edf7f5] p-4 text-sm text-[var(--slate)]">
                {checkpoint}
              </li>
            ))}
          </ul>
          <div className="rounded-[1.25rem] bg-[#fff3e8] p-4">
            <p className="text-sm font-semibold text-[var(--ink)]">Check-in question</p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {snapshot.recoveryPlan.checkInQuestion}
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
