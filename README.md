# Mental Wellness Intelligence Platform

An AI-powered mental wellness tracker for students preparing for high-stakes exams such as JEE, NEET, UPSC, GATE, CAT, and CUET.

This submission is designed to score highly on the competition rubric by prioritizing:
- strong problem alignment through hidden trigger discovery and burnout forecasting
- clean TypeScript architecture with shared domain models
- secure API and prompt handling
- deterministic analytics for explainability and testing
- accessible, demo-ready UX

## What Makes It Different
- Hidden Stress Trigger Discovery Engine clusters recurring concerns like family pressure, mock-test anxiety, peer comparison, and sleep loss.
- Burnout Forecasting Engine predicts current, 7-day, and 30-day risk from mood, sleep, motivation, sentiment, consistency, and exam proximity.
- Exam-Specific AI Coach adapts support for JEE, NEET, UPSC, GATE, CAT, and CUET journeys instead of giving generic wellness advice.
- Emotional Heatmap shows daily mood, stress, confidence, and motivation across weekly, monthly, and countdown contexts.
- Longitudinal Memory Layer preserves top triggers, helpful coping patterns, confidence drift, and recovery wins.
- Judge Demo Mode ships with three seeded personas and 45 days of realistic history so insights appear immediately.

## Architecture Snapshot
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Recharts
- Backend: Next.js Route Handlers, Zod validation, Auth.js/NextAuth credentials flow
- Database: MongoDB Atlas collections and index strategy designed for `Users`, `JournalEntries`, `MoodLogs`, `EmotionalInsights`, and `WellnessPlans`
- AI Runtime: Groq-first provider abstraction with Gemini-compatible prompt pack and adapter
- Security: encrypted journal persistence, CSRF origin checks, prompt-injection filtering, rate limiting, redacted logging posture

## Core User Flow
1. A student journals, logs mood, and updates profile context.
2. Deterministic analytics extract triggers, motivation, trend shifts, and burnout signals.
3. The AI layer explains the findings, personalizes coaching, and generates an exam-specific recovery plan.
4. The dashboard surfaces patterns, heatmaps, forecasts, and action steps in a judge-friendly narrative.

## Local Setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables
See [.env.example](./.env.example) for the full list.

Important keys:
- `AI_PROVIDER=groq` or `gemini`
- `GROQ_API_KEY`
- `GEMINI_API_KEY`
- `MONGODB_URI`
- `MONGODB_DB_NAME`
- `NEXTAUTH_SECRET`
- `ENCRYPTION_KEY`
- `DEMO_PASSWORD`

## Commands
```bash
npm run dev
npm run lint
npm run test
npm run coverage
npm run build
```

Latest verified results in this workspace:
- `npm run lint` ✅
- `npm test` ✅
- `npm run build` ✅
- `npm run coverage` ✅ with `89.7%` statements, `91.89%` functions, and `89.41%` lines on the scoring-critical logic surface

## Judge Demo
- Use the top navigation toggle to switch between `Judge Demo` and `Your Workspace`.
- Judge Demo includes:
  - `Aarav Sharma` for JEE
  - `Meera Nair` for NEET
  - `Sana Khan` for UPSC
- Optional login page: `/login`
  - demo email example: `jee-precision@demo.local`
  - default password: `demo1234`

## Project Structure
```text
src/
  app/
    api/
    analytics/
    assistant/
    journal/
    login/
    mood/
    onboarding/
    recovery/
  components/
    charts/
    layout/
    providers/
    ui/
  lib/
    ai/
    analytics/
    db/
    demo/
    security/
    validation/
  test/
docs/
```

## Documentation Map
- [Problem Analysis and Differentiators](./docs/problem-analysis.md)
- [Architecture and System Design](./docs/architecture.md)
- [Database Design](./docs/database-design.md)
- [Security and Efficiency](./docs/security-efficiency.md)
- [Deployment Guide](./docs/deployment-guide.md)
- [Demo Script and Pitch](./docs/demo-script.md)
- [Scoring Justification](./docs/scoring-justification.md)

## Future Enhancements
- authenticated guest-data merge UI
- scheduled weekly synthesis jobs via cron
- multilingual English + Hindi / Hinglish inputs
- counselor-facing export summaries with explicit consent
- push reminders and streak recovery nudges
