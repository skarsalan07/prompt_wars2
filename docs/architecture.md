# Architecture and System Design

## Product Vision
Help exam aspirants feel emotionally understood, not merely monitored, by translating daily reflections and mood signals into predictive, personalized, and explainable wellness support.

## User Journey
1. Student selects exam type, stage, exam date, and focus subjects.
2. Student journals and logs mood, sleep, confidence, and study consistency.
3. Analytics engines derive triggers, motivation, patterns, and burnout forecasts.
4. The AI coach explains what matters most and suggests exam-specific next steps.
5. Recovery plans activate when burnout or anxiety signals cross thresholds.

## User Flow Diagram
```mermaid
flowchart TD
  A[Onboarding] --> B[Journal Entry + Mood Log]
  B --> C[Deterministic Analytics Layer]
  C --> D[Trigger Clustering]
  C --> E[Burnout Forecasting]
  C --> F[Motivation Index]
  C --> G[Pattern Discovery]
  D --> H[Dashboard + Heatmap]
  E --> H
  F --> H
  G --> H
  H --> I[Exam-Specific AI Coach]
  H --> J[Recovery Plan Engine]
  I --> K[Longitudinal Memory Update]
  J --> K
```

## Product Flow Diagram
```mermaid
flowchart LR
  A[Student opens app] --> B{Mode}
  B -->|Judge Demo| C[Seeded persona snapshot]
  B -->|Guest| D[Local-first workspace]
  B -->|Authenticated| E[Mongo-backed profile]
  C --> F[Journal + Mood + Analytics]
  D --> F
  E --> F
  F --> G[Trigger discovery + burnout forecast]
  G --> H[AI coach + recovery plan]
  H --> I[Next-day reflection loop]
```

## Feature Architecture
- **Input layer**: journaling, mood logs, profile context, event tags
- **Deterministic analytics layer**: trigger extraction, burnout scoring, motivation calculation, pattern rules, recovery logic
- **LLM personalization layer**: insight explanation, coaching tone, exam-context adaptation, motivational reframing
- **Presentation layer**: dashboard, analytics, heatmap, coach chat, recovery workspace
- **Safety layer**: schema validation, prompt-injection filtering, crisis-risk guidance, CSRF checks, encryption, rate limits

## Functional Requirements
- analyze journaling entries for emotional signals and negative thought patterns
- identify recurring triggers weekly and monthly with evidence snippets
- compute current plus 7-day and 30-day burnout risk
- generate exam-specific recommendations and recovery plans
- maintain memory summaries across time
- support anonymous-first use with a judge-ready demo mode

## Non-Functional Requirements
- fast initial load with seeded demo data
- deterministic and explainable core analytics
- secure handling of sensitive text
- modular TypeScript architecture
- high testability and strong validation boundaries
- mobile-responsive and keyboard-accessible UX

## Accessibility Requirements
- WCAG 2.1 AA baseline
- keyboard-accessible navigation, forms, and controls
- color-blind-friendly palette with non-color-only state indicators
- reduced-motion friendly transitions
- screen-reader labels and chart summaries

## Security Requirements
- validate every request body with Zod
- encrypt journal text before persistence
- treat user text as untrusted input for prompts
- reject prompt-injection-like instructions
- enforce origin checks for non-GET writes
- rate-limit public API usage
- avoid HTML rendering of untrusted content

## AI System Design
### Prompt Strategy
- deterministic analytics produce the facts
- the model is asked to explain, personalize, and motivate
- prompts are exam-aware and memory-aware
- responses must fit strict JSON contracts before being accepted

### Context Management
- current journal entry or message
- profile context: exam type, stage, target date, focus subjects
- top trigger clusters
- latest burnout forecast
- memory summary note

### Memory System
- store top triggers, helpful coping strategies, motivation trend, confidence trend, and recovery wins
- update after weekly synthesis and recovery-plan progress

### Retrieval Design
- v1 retrieval is lightweight and purpose-built: use rolling summaries and top insights instead of replaying full history
- demo mode relies on precomputed seed data for instant insight rendering

### Safety and Hallucination Prevention
- schema-validated AI outputs
- deterministic math for trigger ranking, motivation, and burnout
- model cannot invent numeric risk scores
- fallback coaching is available without external AI keys

## AI Architecture Diagram
```mermaid
flowchart LR
  A[Journal + Mood Inputs] --> B[Validation + Sanitization]
  B --> C[Deterministic Analytics]
  C --> D[Structured Insight Object]
  D --> E[Groq / Gemini Adapter]
  E --> F[LLM Explanation + Coaching JSON]
  F --> G[Schema Validation]
  G --> H[Dashboard / Coach / Recovery Plan]
  C --> I[Longitudinal Memory Summary]
  I --> E
  B --> J[Safety Detection]
  J --> H
```

## Data Flow Diagram
```mermaid
flowchart TD
  A[Journal text + mood logs] --> B[Zod validation]
  B --> C[Deterministic analytics engine]
  C --> D[Derived snapshot]
  D --> E[EmotionalInsights cache]
  D --> F[Prompt contracts]
  F --> G[Groq or Gemini adapter]
  G --> H[Schema-validated JSON output]
  H --> I[Dashboard, coach, recovery UI]
  D --> J[Users, JournalEntries, MoodLogs, WellnessPlans]
```

## Safety Flow Diagram
```mermaid
flowchart TD
  A[Incoming request] --> B[CSRF + rate limit]
  B --> C[Zod schema validation]
  C --> D[Prompt-input sanitization]
  D --> E{Prompt injection?}
  E -->|Yes| F[Reject request]
  E -->|No| G[Deterministic analysis]
  G --> H{Crisis-risk language?}
  H -->|Yes| I[Urgent support guidance]
  H -->|No| J[Standard coaching response]
  I --> K[Safe UI rendering]
  J --> K
```

## Why This Wins Diagram
```mermaid
flowchart LR
  A[Exam-specific context] --> E[Judge-visible differentiation]
  B[Hidden trigger discovery] --> E
  C[Burnout forecasting] --> E
  D[Live AI with fallback safety] --> E
  E --> F[Immediate demo credibility]
```

## Engineer-Facing System Diagram
```mermaid
flowchart LR
  A[App Router pages] --> B[Route handlers]
  B --> C[Validation + security helpers]
  C --> D[Analytics engines]
  D --> E[AI adapters]
  D --> F[Mongo repository]
  F --> G[(MongoDB Atlas)]
  E --> H[(Groq / Gemini)]
  D --> I[Seed/demo snapshot generator]
```

## API Surface
- `POST /api/journal-entries`
- `POST /api/mood-logs`
- `POST /api/insights/analyze`
- `GET /api/analytics/summary`
- `GET /api/analytics/heatmap`
- `GET /api/triggers/summary`
- `GET /api/forecast/burnout`
- `GET /api/insights/patterns`
- `POST /api/recovery-plans/generate`
- `POST /api/assistant/chat`
- `POST /api/account/merge`
- `GET /api/demo/bootstrap`
