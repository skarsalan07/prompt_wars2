# Database Design

## ER Diagram
```mermaid
erDiagram
  Users ||--o{ JournalEntries : owns
  Users ||--o{ MoodLogs : records
  Users ||--o{ EmotionalInsights : derives
  Users ||--o{ WellnessPlans : follows

  Users {
    string id
    string name
    string email
    string examType
    string preparationStage
    date targetExamDate
    string[] focusSubjects
    string mockScoreContext
    object memorySummary
  }

  JournalEntries {
    string id
    string userId
    date entryDate
    string title
    string reflectionPrompt
    string textPreview
    string encryptedText
    number sentimentScore
    object[] triggerMentions
    object safetyFlag
  }

  MoodLogs {
    string id
    string userId
    date entryDate
    number mood
    number stress
    number confidence
    number motivation
    number sleepHours
    number studyConsistency
    number goalCompletion
    string[] eventTags
  }

  EmotionalInsights {
    string userId
    object[] dailyInsights
    object[] periodSummaries
    object[] heatmap
  }

  WellnessPlans {
    string id
    string userId
    date createdAt
    number durationDays
    string focusArea
    object[] tasks
    string status
  }
```

## Collections
### `Users`
- exam context and profile settings
- demo persona tagging
- latest longitudinal memory summary

### `JournalEntries`
- encrypted journal body
- preview text for safe UI rendering
- extracted triggers and negative thoughts
- safety metadata and sentiment score

### `MoodLogs`
- numeric emotional signals
- sleep, motivation, study consistency, goal completion
- event tags for pattern detection

### `EmotionalInsights`
- precomputed daily insight rows
- weekly and monthly trigger summaries
- burnout forecast snapshots
- heatmap cells and memory summaries

### `WellnessPlans`
- active and completed recovery plans
- task list, checkpoints, adherence, and outcomes

## Indexing Strategy
| Collection | Index | Purpose |
|---|---|---|
| `JournalEntries` | `{ userId: 1, entryDate: -1 }` | recent journal retrieval and trend windows |
| `MoodLogs` | `{ userId: 1, entryDate: -1 }` | heatmap, burnout, and motivation queries |
| `EmotionalInsights` | `{ userId: 1, "periodSummaries.periodType": 1, "periodSummaries.periodStart": -1 }` | summary retrieval |
| `WellnessPlans` | `{ userId: 1, status: 1, createdAt: -1 }` | active-plan lookup |
| `Users` | `{ examType: 1, demoPersona: 1 }` | judge demo bootstrapping |
| `RateLimits` | `{ expiresAt: 1 }` with TTL | automatic throttling cleanup |

## Schema Notes
- journal text is encrypted before persistence and never rendered as raw HTML
- `EmotionalInsights` acts as the cached analytics layer to reduce repeated recomputation
- demo personas can bypass database setup because the same snapshot model is generated deterministically in code
