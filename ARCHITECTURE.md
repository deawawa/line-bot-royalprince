# Architecture

```
LINE OA (@royalprince)
   │  webhook (signature-verified)
   ▼
/api/line/webhook  ──────────────┐
   │                             │ rate limit (per user)
   ▼                             │
AI Engine (src/lib/ai/engine.ts) │
   ├─ Intent detection (rule-based, src/lib/ai/intents.ts)
   ├─ Language detection (th/en)
   ├─ Deterministic replies (handoff/complaint/group — no LLM)
   ├─ KB retrieval (src/lib/kb/retrieve.ts — category+keyword; vector-ready interface)
   ├─ Active promotions only (src/lib/promotions.ts)
   └─ LLM via AI SDK (src/lib/ai/provider.ts — Anthropic/OpenAI switch by env)
   ▼
Reply bundle: text + Quick Reply + Flex cards (promotion / booking CTA / contact)
   ▼
Side effects: messages + conversations + leads (score COLD→WARM→HOT) + events + booking_requests
   ▼
Admin Dashboard (/admin): metrics, leads, promotions CRUD, KB CRUD, conversations, audit log
```

## Key design decisions

- **Provider-agnostic AI**: `getModel()` reads `AI_PROVIDER`/`AI_MODEL` env — business logic
  never imports a specific vendor SDK.
- **Retrieval layer is swappable**: `retrieveKnowledge(message, intent)` currently uses
  category routing + keyword match. A vector implementation can replace it with the same
  signature (interface unchanged).
- **Booking engine integration layer**: there is no live availability API today, so the AI
  never claims to check availability; it always sends the official direct-booking CTA with
  UTM tracking. A future Availability/Rate API plugs in behind `src/lib/` without touching
  the engine.
- **Human handoff**: once a conversation is flagged `human_handoff`, the webhook stays
  silent for that conversation so staff can reply in LINE OA Manager. Admin can flip it
  back in /admin/conversations.
- **Promotion safety**: only `status='active'` AND non-expired dates are ever passed into
  the model context. A daily Vercel cron flips expired rows.
- **RLS**: all bot tables have RLS enabled with no policies. The app connects with the
  `postgres` role (bypasses RLS); anon/authenticated Supabase keys are fully blocked.

## Database

Tables: users, conversations, messages, leads, promotions, knowledge_base,
booking_requests, events, admin_users, audit_logs, settings — all with
created_at/updated_at. See `drizzle/0000_init.sql` and `src/db/schema.ts`.

## Environments

- **Development**: local `npm run dev` + your own `.env`
- **Preview**: every GitHub PR → Vercel preview deployment
- **Production**: `main` branch → Vercel production

Branch model: `main` (production) ← `develop` ← `feature/xxx` / `fix/xxx` / `hotfix/xxx`.
