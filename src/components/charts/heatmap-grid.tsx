import type { HeatmapCell } from "@/lib/types";

import { cn } from "@/lib/utils";

function toneClass(value: number) {
  if (value >= 8) {
    return "bg-[#e76f51] text-white";
  }

  if (value >= 6) {
    return "bg-[#f4a261] text-[var(--ink)]";
  }

  if (value >= 4) {
    return "bg-[#e9c46a] text-[var(--ink)]";
  }

  return "bg-[#2a9d8f] text-white";
}

export function HeatmapGrid({
  cells,
  metric,
  title,
}: {
  cells: HeatmapCell[];
  metric: "mood" | "stress" | "confidence" | "motivation";
  title: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--slate)]">
          {title}
        </h3>
        <p className="text-xs text-[var(--muted)]">
          Darker warm tones indicate higher strain; teal signals stronger recovery.
        </p>
      </div>
      <div
        aria-label={`${title} heatmap`}
        className="grid grid-cols-7 gap-2 md:grid-cols-9"
        role="img"
      >
        {cells.slice(-28).map((cell, index) => (
          <div
            key={`${metric}-${cell.date}-${index}`}
            aria-label={`${cell.date}: ${metric} ${cell[metric]} out of 10`}
            className={cn(
              "flex h-14 items-end rounded-2xl p-2 text-xs font-semibold",
              toneClass(metric === "stress" ? cell[metric] : 10 - cell[metric]),
            )}
            title={`${cell.date}: ${metric} ${cell[metric]}/10`}
          >
            <span>{cell.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
