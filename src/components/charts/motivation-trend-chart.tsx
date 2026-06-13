"use client";

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
  return (
    <div className="h-72 w-full">
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
  );
}
