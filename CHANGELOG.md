# Changelog

## [0.1.0] — 2026-07-25

### Added
- Initial production-ready scaffold.
- LINE webhook (`/api/line/webhook`) with signature verification, text/postback/follow
  handling, Quick Reply, Flex Messages (promotion card, booking CTA, contact card).
- Provider-agnostic AI engine (Anthropic/OpenAI via env) with rule-based intent detection
  (27 intents), th/en language detection, anti-hallucination system prompt, deterministic
  handoff replies.
- Knowledge base + retrieval layer (category routing + keyword match, vector-ready).
- Promotion system with draft/active/expired/archived lifecycle and daily auto-expiration
  cron (`/api/cron/expire-promotions`).
- Lead capture with HOT/WARM/COLD scoring (escalate-only) and status pipeline.
- Analytics events + booking CTA UTM tracking.
- Admin console (`/admin`): dashboard metrics, leads, promotions CRUD, knowledge CRUD,
  conversation viewer with handoff/resolve controls; JWT session auth; audit logging.
- Rich Menu setup script (`scripts/setup-richmenu.ts`).
- Database schema applied to Supabase project `AFP RPRP2` (`dhzjkupsxntigkisfglg`) with
  RLS enabled; seeded with real room rates, 3 active + 2 draft promotions, and 12 KB
  entries collected from live testing on 2026-07-25.
- Vitest test suite (intents, security, promotions, engine routing), GitHub Actions CI,
  full documentation set.
