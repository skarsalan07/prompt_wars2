"use client";

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
  return (
    <div className="h-72 w-full">
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
  );
}
