# Setup and Deployment Guide

## Local Development
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Recommended Competition Deployment
- frontend and API routes: Vercel
- database: MongoDB Atlas
- AI provider: Groq by default, Gemini optional through env switch

## Vercel Steps
1. Import the repository into Vercel.
2. Add environment variables from `.env.example`.
3. Set `AI_PROVIDER=groq` unless you want Gemini as the runtime.
4. Deploy and verify `/`, `/analytics`, `/assistant`, and `/login`.

## MongoDB Atlas Steps
1. Create a cluster and database user.
2. Allow your deployment IP or Vercel egress range.
3. Set `MONGODB_URI` and `MONGODB_DB_NAME`.
4. The app creates required indexes when persistence is used.

## Production Verification Checklist
- `npm run lint`
- `npm test`
- `npm run coverage`
- `npm run build`
- demo persona switching works
- journal and mood routes respond with valid JSON
- login page works with demo credentials
