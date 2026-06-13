export const EXAM_TYPES = ["JEE", "NEET", "UPSC", "GATE", "CAT", "CUET"] as const;

export const PREPARATION_STAGES = [
  "foundation",
  "revision",
  "mock-intense",
  "final-sprint",
] as const;

export const RISK_BANDS = ["low", "medium", "high"] as const;

export const SAFETY_LEVELS = ["none", "support", "urgent"] as const;

export const TRIGGER_CATEGORIES = [
  "performance",
  "family",
  "time-management",
  "comparison",
  "sleep",
  "future",
  "health",
  "confidence",
] as const;

export const PATTERN_TYPES = [
  "before_mock_test",
  "after_low_score",
  "after_exercise",
  "after_revision_completion",
  "countdown_pressure",
] as const;

export type ExamType = (typeof EXAM_TYPES)[number];
export type PreparationStage = (typeof PREPARATION_STAGES)[number];
export type RiskBand = (typeof RISK_BANDS)[number];
export type SafetyLevel = (typeof SAFETY_LEVELS)[number];
export type TriggerCategory = (typeof TRIGGER_CATEGORIES)[number];
export type PatternType = (typeof PATTERN_TYPES)[number];
export type AppMode = "guest" | "demo" | "authenticated";
export type AIProvider = "groq" | "gemini" | "local";

export interface StudentProfile {
  id: string;
  name: string;
  email?: string;
  examType: ExamType;
  preparationStage: PreparationStage;
  targetExamDate: string;
  focusSubjects: string[];
  mockScoreContext?: string;
  timezone?: string;
  demoPersona?: string;
}

export interface TriggerMention {
  id: string;
  canonicalLabel: string;
  category: TriggerCategory;
  severity: number;
  evidenceSnippet: string;
  confidence: number;
  source: "journal" | "mood";
  entryDate: string;
}

export interface EmotionVector {
  calm: number;
  anxious: number;
  hopeful: number;
  exhausted: number;
}

export interface SafetyFlag {
  level: SafetyLevel;
  reason: string;
  supportMessage: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  entryDate: string;
  title: string;
  reflectionPrompt: string;
  textPreview: string;
  encryptedText?: string;
  plainText?: string;
  sentimentScore: number;
  negativeThoughts: string[];
  triggerMentions: TriggerMention[];
  copingActions: string[];
  anxietyIndicator: number;
  stressIntensity: number;
  confidenceLevel: number;
  motivationLevel: number;
  emotionVector: EmotionVector;
  safetyFlag: SafetyFlag;
}

export interface MoodLog {
  id: string;
  userId: string;
  entryDate: string;
  mood: number;
  stress: number;
  confidence: number;
  motivation: number;
  sleepHours: number;
  studyConsistency: number;
  goalCompletion: number;
  eventTags: string[];
  notes?: string;
}

export interface TriggerClusterSummary {
  canonicalLabel: string;
  category: TriggerCategory;
  frequency: number;
  impactScore: number;
  averageStress: number;
  averageConfidenceDrop: number;
  averageSleepDeficit: number;
  evidenceSnippets: string[];
  mentionDates: string[];
}

export interface ForecastPoint {
  riskBand: RiskBand;
  probability: number;
  score: number;
}

export interface BurnoutForecast {
  currentRiskBand: RiskBand;
  currentScore: number;
  forecast7d: ForecastPoint;
  forecast30d: ForecastPoint;
  reasonFactors: string[];
}

export interface MotivationIndexPoint {
  date: string;
  rawScore: number;
  smoothedScore: number;
}

export interface HeatmapCell {
  date: string;
  mood: number;
  stress: number;
  confidence: number;
  motivation: number;
  countdownDay: number | null;
}

export interface PatternInsight {
  id: string;
  type: PatternType;
  title: string;
  summary: string;
  confidence: number;
  evidenceSnippets: string[];
  recommendedAction: string;
}

export interface RecoveryTask {
  id: string;
  title: string;
  type: "study" | "wellness" | "mindfulness" | "motivation";
  description: string;
  done: boolean;
}

export interface RecoveryPlan {
  id: string;
  userId: string;
  createdAt: string;
  durationDays: number;
  triggerReason: string;
  focusArea: string;
  checkInQuestion: string;
  tasks: RecoveryTask[];
  checkpoints: string[];
  status: "active" | "completed";
}

export interface AssistantMemorySummary {
  summaryDate: string;
  topTriggers: string[];
  helpfulCopingStrategies: string[];
  motivationTrend: string;
  confidenceTrend: string;
  recoveryWins: string[];
  noteForCoach: string;
}

export interface InsightAnalysisResult {
  emotionVector: EmotionVector;
  triggerMentions: TriggerMention[];
  negativeThoughts: string[];
  burnoutForecast: BurnoutForecast;
  anxietyIndicators: string[];
  motivationIndex: number;
  recommendedActions: string[];
  confidence: number;
  evidenceSpans: string[];
  safetyFlag: SafetyFlag;
}

export interface AIResponseMeta {
  provider: AIProvider;
  model: string;
  usedLiveModel: boolean;
  mode: "live" | "fallback";
  reason?: string;
}

export interface DailyInsight {
  date: string;
  mood: number;
  stress: number;
  confidence: number;
  motivation: number;
  burnoutScore: number;
}

export interface PeriodSummary {
  periodType: "weekly" | "monthly";
  periodStart: string;
  topTriggers: TriggerClusterSummary[];
  burnoutForecast: BurnoutForecast;
  motivationTrend: MotivationIndexPoint[];
  patterns: PatternInsight[];
  memorySummary: AssistantMemorySummary;
}

export interface EmotionalInsightDocument {
  userId: string;
  dailyInsights: DailyInsight[];
  periodSummaries: PeriodSummary[];
  heatmap: HeatmapCell[];
}

export interface DemoSnapshot {
  mode: AppMode;
  profile: StudentProfile;
  journalEntries: JournalEntry[];
  moodLogs: MoodLog[];
  topTriggers: TriggerClusterSummary[];
  burnoutForecast: BurnoutForecast;
  motivationTrend: MotivationIndexPoint[];
  heatmap: HeatmapCell[];
  patterns: PatternInsight[];
  recoveryPlan: RecoveryPlan;
  memorySummary: AssistantMemorySummary;
  activeCoachPrompt: string;
}

export interface CoachResponse {
  reply: string;
  recommendedExercises: string[];
  suggestedPrompts: string[];
  safetyFlag: SafetyFlag;
  meta?: AIResponseMeta;
}

export interface JournalAnalysisResponse {
  entry: JournalEntry;
  analysis: InsightAnalysisResult;
  meta: AIResponseMeta;
}
