import type { TriggerCategory } from "@/lib/types";

export type TriggerDefinition = {
  canonicalLabel: string;
  category: TriggerCategory;
  keywords: string[];
};

export const TRIGGER_TAXONOMY: TriggerDefinition[] = [
  {
    canonicalLabel: "Family Expectations",
    category: "family",
    keywords: ["parents", "family", "expectation", "pressure at home", "relatives"],
  },
  {
    canonicalLabel: "Fear of Failure",
    category: "performance",
    keywords: ["fail", "failure", "not enough", "mess it up", "disappoint"],
  },
  {
    canonicalLabel: "Mock Test Performance",
    category: "performance",
    keywords: ["mock", "score", "percentile", "rank", "test result"],
  },
  {
    canonicalLabel: "Time Management Issues",
    category: "time-management",
    keywords: ["time", "schedule", "backlog", "unfinished", "late", "plan"],
  },
  {
    canonicalLabel: "Peer Comparison",
    category: "comparison",
    keywords: ["friends", "others", "peer", "comparison", "everyone else", "batchmate"],
  },
  {
    canonicalLabel: "Lack of Sleep",
    category: "sleep",
    keywords: ["sleep", "tired", "exhausted", "restless", "awake", "insomnia"],
  },
  {
    canonicalLabel: "Future Career Uncertainty",
    category: "future",
    keywords: ["future", "career", "college", "uncertain", "what if", "backup"],
  },
  {
    canonicalLabel: "Confidence Dip",
    category: "confidence",
    keywords: ["confidence", "self-doubt", "doubt", "blank out", "stuck"],
  },
  {
    canonicalLabel: "Health and Energy Strain",
    category: "health",
    keywords: ["health", "headache", "burned out", "sick", "low energy", "fatigue"],
  },
];

export const POSITIVE_WORDS = [
  "better",
  "calm",
  "focused",
  "progress",
  "grateful",
  "steady",
  "relieved",
  "confident",
  "finished",
  "exercise",
  "strong",
];

export const NEGATIVE_WORDS = [
  "panic",
  "anxious",
  "stressed",
  "overwhelmed",
  "fail",
  "pressure",
  "helpless",
  "worthless",
  "tired",
  "exhausted",
  "scared",
  "confused",
  "burned out",
];

export const COPING_KEYWORDS = [
  "walk",
  "exercise",
  "meditation",
  "breathing",
  "revision checklist",
  "sleep early",
  "talked to a friend",
  "break",
];
