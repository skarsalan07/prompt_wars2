# Security and Efficiency

## Security Decisions
### Input Validation
- all public request bodies use Zod schemas before any processing
- malformed payloads fail fast with clear API errors

### Prompt Injection Protection
- journaling and assistant text are sanitized before entering prompts
- obvious jailbreak and system-prompt extraction phrases are rejected
- the LLM never owns deterministic numeric outputs

### XSS Prevention
- journal previews are rendered as plain text
- untrusted content is escaped before display helpers would allow rendering

### CSRF Protection
- non-GET route handlers verify `origin` and `host` alignment
- cross-site writes are rejected immediately

### Secure API Design
- public APIs are rate limited
- auth is isolated to credential-based demo/admin flows
- account merge requires an authenticated session

### Data Encryption
- AES-256-GCM is used for journal encryption at rest in application code
- the encryption key is environment-driven

### Secret Management
- all keys and credentials live in environment variables
- README ships with `.env.example` only

## Efficiency Decisions
### Token Efficiency
- deterministic analytics produce the main facts first
- the model receives compact summaries instead of full history replay
- prompts include only top triggers, current forecast, and memory notes

### Data Efficiency
- analytics are precomputed into `EmotionalInsights`
- judge demo mode avoids database dependency entirely
- guest mode uses local-first storage to reduce round trips

### Rendering Efficiency
- Next.js static pages render fast with demo data
- charts hydrate on the client to avoid SSR layout warnings
- concise cards and summaries surface value quickly for judges

### Expected Gains
| Optimization | Expected Outcome |
|---|---|
| deterministic scoring before LLM calls | fewer tokens and better explainability |
| cached analytics summaries | lower repeated compute and faster dashboards |
| seeded demo personas | instant wow-factor with no waiting for history |
| local-first anonymous mode | lower backend dependence for first-run users |
| schema-validated AI outputs | lower recovery cost from malformed responses |
