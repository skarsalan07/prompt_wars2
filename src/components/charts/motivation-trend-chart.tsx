"use client";

import { useId } from "react";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MotivationIndexPoint } from "@/lib/types";

export function MotivationTrendChart({
  data,
}: {
  data: MotivationIndexPoint[];
}) {
  const titleId = useId();
  const summaryId = useId();
  const highestPoint = [...data].sort((left, right) => right.smoothedScore - left.smoothedScore)[0];
  const lowestPoint = [...data].sort((left, right) => left.smoothedScore - right.smoothedScore)[0];
  const latestPoint = data.at(-1);

  return (
    <figure aria-describedby={summaryId} aria-labelledby={titleId} className="space-y-2">
      <figcaption className="sr-only" id={titleId}>
        Motivation trend chart
      </figcaption>
      <p className="sr-only" id={summaryId}>
        {data.length
          ? `Latest motivation is ${latestPoint?.smoothedScore ?? 0} out of 100 on ${latestPoint?.date ?? "the latest day"}. Highest recent motivation was ${highestPoint?.smoothedScore ?? 0}, and the lowest was ${lowestPoint?.smoothedScore ?? 0}.`
          : "No motivation trend data is available yet."}
      </p>
      <div aria-hidden="true" className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="motivationFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#2a9d8f" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2a9d8f" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d9e6e2" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area
              dataKey="smoothedScore"
              fill="url(#motivationFill)"
              fillOpacity={1}
              stroke="#2a9d8f"
              strokeWidth={3}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
