# Deployment Guide

## 1. GitHub

```bash
cd royal-prince-linebot
git init -b main
git add .
git commit -m "feat: initial RPRP LINE AI chatbot scaffold"
# create repo on github.com (private recommended), then:
git remote add origin https://github.com/<you>/royal-prince-linebot.git
git push -u origin main
git checkout -b develop && git push -u origin develop
```

Branch model: `feature/xxx` → PR → CI → review → merge `develop` → preview QA →
merge `main` → production. CI (`.github/workflows/ci.yml`) runs install, lint,
typecheck, tests, build, npm audit — a failed CI must never be deployed.

## 2. Vercel

1. vercel.com → Add New Project → import the GitHub repo.
2. Framework preset: Next.js (auto-detected). Root directory: repo root.
3. Add all env vars from [ENVIRONMENT.md](./ENVIRONMENT.md) for **Production** and **Preview**.
4. Deploy. Production tracks `main`; every PR gets a preview URL.
5. Cron: `vercel.json` registers `/api/cron/expire-promotions` daily at 01:00 UTC
   (08:00 Thailand). Set `CRON_SECRET` to protect it.

Rollback: Vercel → Deployments → previous build → "Promote to Production".

## 3. Database (already provisioned)

Supabase project **AFP RPRP2** (`dhzjkupsxntigkisfglg`, ap-southeast-1).
Schema + seed already applied (see `drizzle/0000_init.sql`). For future schema
changes: add a new SQL file in `drizzle/`, test on a branch DB or local Postgres,
then apply — never drop/reset production data without approval.

## 4. LINE Official Account

1. [LINE Developers Console](https://developers.line.biz) → your provider → the
   Messaging API channel for @royalprince.
2. Copy Channel secret + issue a Channel access token → put in Vercel env vars.
3. Webhook URL: `https://<your-domain>/api/line/webhook` → Verify → enable **Use webhook**.
4. In LINE OA Manager: disable auto-reply & greeting messages (the bot handles both).
5. Rich Menu: `LINE_CHANNEL_ACCESS_TOKEN=... npm run richmenu:setup`, then upload a
   2500x1686 image for the returned richMenuId and set it as default (commands are
   printed by the script).

## 5. Post-deploy QA checklist

- [ ] Send "สวัสดี" → greeting + Quick Reply appears
- [ ] "มีห้องอะไรบ้าง" → 3 room types, no invented prices
- [ ] "โปรโมชั่น" → only active promotions + booking CTA card
- [ ] "จองห้อง" → asks dates/guests, sends direct booking CTA with UTM
- [ ] "ขอคุยกับพนักงาน" → contact card + conversation flagged handoff, bot goes silent
- [ ] /admin login works; dashboard shows the conversation and lead
- [ ] Invalid signature request to webhook returns 401
