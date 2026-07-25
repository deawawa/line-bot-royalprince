# Royal Prince Resort Pattaya — LINE AI Chatbot

AI Reservation & Sales Assistant for the hotel's LINE Official Account (@royalprince).
Answers guests 24/7 in Thai/English, promotes **direct booking**, captures leads, and
hands off to staff when needed.

**Official Direct Booking URL (source of truth — never change):**
https://book-directonline.com/properties/royalprincepattaya

## Stack

Next.js 14 (App Router, TypeScript) · Tailwind CSS · Drizzle ORM · PostgreSQL (Supabase) ·
Vercel AI SDK (provider-agnostic: Anthropic/OpenAI) · Zod · Vitest · GitHub Actions · Vercel

## Quick start

```bash
npm install
cp .env.example .env        # fill in secrets (see docs/ENVIRONMENT.md)
npm run dev                 # http://localhost:3000
```

Database schema is in `drizzle/0000_init.sql` (already applied to the Supabase
project `AFP RPRP2` / `dhzjkupsxntigkisfglg`). Admin console: `/admin` (login at `/login`).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run lint` / `typecheck` / `test` | CI checks |
| `npm run richmenu:setup` | Create the LINE Rich Menu |

## Docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design & data flow
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) — GitHub → Vercel → LINE setup steps
- [ENVIRONMENT.md](./docs/ENVIRONMENT.md) — all env vars
- [API.md](./docs/API.md) — endpoints
- [SECURITY.md](./docs/SECURITY.md) — security model
- [CHANGELOG.md](./CHANGELOG.md) · [TODO.md](./TODO.md)

## Operating principles

AI answers → recommends → soft-sells → captures leads → sends guests to **direct booking**
→ hands off to staff when needed. The AI must never invent prices, promotions, availability,
or URLs; the knowledge base and promotions tables are the only sources of truth.
