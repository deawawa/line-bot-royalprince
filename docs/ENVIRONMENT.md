# Environment Variables

Copy `.env.example` → `.env` locally. In Vercel, set these under
Project → Settings → Environment Variables (Production + Preview).
**Never commit `.env` or hardcode secrets.**

| Variable | Required | Description |
|---|---|---|
| `LINE_CHANNEL_ACCESS_TOKEN` | ✅ | LINE Messaging API channel access token (long-lived) |
| `LINE_CHANNEL_SECRET` | ✅ | Used to verify `X-Line-Signature` on every webhook call |
| `AI_PROVIDER` | ✅ | `anthropic` or `openai` — switch without code changes |
| `AI_MODEL` | ✅ | Model id, e.g. `claude-sonnet-4-5` or `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | if anthropic | Anthropic key |
| `OPENAI_API_KEY` | if openai | OpenAI key |
| `AI_API_KEY` | optional | Generic fallback key if provider-specific one missing |
| `DATABASE_URL` | ✅ | Supabase **transaction pooler** URL (port 6543, `prepare=false` handled in code) |
| `ADMIN_SECRET` | ✅ | ≥16 random chars; signs admin session JWT |
| `ADMIN_USERNAME` | ✅ | Admin login username |
| `ADMIN_PASSWORD` | ✅ | Admin login password (use a strong one) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of the deployment |
| `CRON_SECRET` | recommended | Vercel Cron auth for `/api/cron/expire-promotions` |

## Where to find DATABASE_URL

Supabase Dashboard → Project `AFP RPRP2` → Connect → **Transaction pooler**:

```
postgresql://postgres.dhzjkupsxntigkisfglg:<PASSWORD>@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

If you don't know the DB password, reset it in Supabase → Settings → Database.
