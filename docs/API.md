# API Reference

## POST /api/line/webhook
LINE Messaging API webhook.
- Verifies `X-Line-Signature` (HMAC-SHA256 of raw body with channel secret); 401 on failure.
- Handles: `follow` (greeting), `message` (text), `postback`.
- Per-user rate limit: 10 msg/min → friendly fallback message.
- Conversations flagged `human_handoff` receive no bot replies.

## GET /api/cron/expire-promotions
Daily Vercel cron. Requires `Authorization: Bearer <CRON_SECRET>` when set.
Flips `active` promotions past `end_date` to `expired`. Returns `{ ok, expired }`.

## POST /admin/logout
Clears the admin session cookie.

## Admin pages (session-gated server components)
- `/login` — admin login (sets HttpOnly JWT cookie, 12h)
- `/admin` — dashboard metrics
- `/admin/leads` — lead table + status pipeline updates (audited)
- `/admin/promotions` — create + lifecycle transitions (audited)
- `/admin/knowledge` — KB entries create/publish/unpublish (audited)
- `/admin/conversations` — transcript viewer, mark active/handoff/resolved

All admin mutations are Next.js server actions guarded by `getSession()` and
written to `audit_logs` (admin user, action, entity, before, after, timestamp).
