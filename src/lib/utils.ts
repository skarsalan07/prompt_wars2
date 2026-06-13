import { clsx, type ClassValue } from "clsx";

export function cn(...values: ClassValue[]) {
  return clsx(values);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function round(value: number, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function formatPercent(value: number) {
  return `${round(value)}%`;
}

export function createId(prefix: string) {
  const suffix =
    globalThis.crypto?.randomUUID?.().slice(0, 8) ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  return `${prefix}-${suffix}`;
}
