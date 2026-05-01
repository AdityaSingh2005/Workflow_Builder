# Deployment And Env Rules

## Purpose

Keep local, preview, and production environments predictable while avoiding committed secrets.

## Rules

- Commit `.env.example`, not real secrets.
- Use Vercel environment variables for deployed secrets.
- Validate env vars at app startup with a typed env module.
- Keep public env vars prefixed with `NEXT_PUBLIC_`.
- Never log secrets.
- Never expose server-only keys to the browser.
- Keep provider-specific config in `src/config` or `src/lib/env`.
- Document every required service key.

## Required Services

- Clerk for auth.
- Neon PostgreSQL for database.
- Trigger.dev for executable node tasks.
- Google AI Studio for Gemini API key.
- Transloadit for uploads.
- Vercel for deployment.

## Required Env Vars

See root `.env.example` for the full contract.

## Implementation Checklist

- `.env.example` stays current.
- `env.ts` validates variables with Zod.
- Server-only env vars are imported only in server files.
- Client code only reads safe `NEXT_PUBLIC_` values.
- Vercel has production values configured before demo.
- Local setup instructions mention database migration and Trigger.dev dev server.

