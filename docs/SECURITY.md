# Security Model

## Webhook
- Every request verified against `X-Line-Signature` (HMAC-SHA256, timing-safe compare).
  Invalid signature → 401, no processing.
- Zod-validated payloads; malformed bodies → 400.
- Per-user in-memory rate limit (10 msg/min). Upgrade to Redis for multi-instance.

## AI / Prompt injection
- System prompt forbids revealing instructions, keys, env, or internal details, and
  instructs the model to ignore rule-override attempts inside user messages.
- Knowledge base + active promotions are the only fact sources; the model is told to
  defer to booking link/staff when data is missing (anti-hallucination).
- High-risk intents (complaint, refund, cancel, group/corporate) never reach the LLM —
  deterministic handoff replies only.
- `maxTokens` capped (500) and history truncated (10 messages) to bound cost/abuse.

## Admin
- HttpOnly, SameSite=Lax, Secure (prod) JWT cookie signed with `ADMIN_SECRET` (HS256, 12h).
- Credentials from env (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) — rotate regularly.
- All mutations behind session checks in server actions; every change audit-logged.

## Database
- Drizzle ORM parameterized queries only — no string-built SQL (SQLi-safe).
- Supabase RLS enabled on all bot tables with zero policies: anon/authenticated keys are
  blocked; only the server-side `postgres` connection works.
- Never expose `DATABASE_URL` client-side (no `NEXT_PUBLIC_` prefix).

## Transport / headers
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, strict referrer policy.
- Admin pages are server-rendered; no secrets in client bundles.

## Secrets
- `.env` is gitignored; `.env.example` contains placeholders only.
- CI uses placeholder values; real secrets exist only in Vercel env vars.

## PDPA / privacy
- Only conversation-necessary data stored (LINE userId, display name, chat text, booking info).
- Access restricted to authenticated admins; all admin actions audited.
- Data retention purge job planned (TODO.md).
