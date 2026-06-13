"use client";

import { useId } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { TriggerClusterSummary } from "@/lib/types";

export function TriggerImpactChart({
  data,
}: {
  data: TriggerClusterSummary[];
}) {
  const titleId = useId();
  const summaryId = useId();
  const topTrigger = data[0];

  return (
    <figure aria-describedby={summaryId} aria-labelledby={titleId} className="space-y-2">
      <figcaption className="sr-only" id={titleId}>
        Trigger impact chart
      </figcaption>
      <p className="sr-only" id={summaryId}>
        {data.length
          ? `Top trigger is ${topTrigger?.canonicalLabel ?? "unavailable"} with an impact score of ${topTrigger?.impactScore ?? 0} out of 100 across ${topTrigger?.frequency ?? 0} mentions.`
          : "No trigger impact data is available yet."}
      </p>
      <div aria-hidden="true" className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0dfd1" />
            <XAxis dataKey="canonicalLabel" interval={0} tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="impactScore" radius={[8, 8, 0, 0]} fill="#f4a261" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
