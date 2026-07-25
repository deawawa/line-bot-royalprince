# TODO

## Before go-live (required)
- [ ] Push repo to GitHub and connect to Vercel (see docs/DEPLOYMENT.md)
- [ ] Set all env vars in Vercel (docs/ENVIRONMENT.md)
- [ ] Set LINE webhook URL to `https://<domain>/api/line/webhook` and disable LINE auto-reply
- [ ] Upload Rich Menu image (2500x1686) and run `npm run richmenu:setup`
- [ ] Confirm Suite & Wine (3,090฿) and 2-Night Chill (2,450฿) promotions with hotel,
      then flip from draft → active in /admin/promotions
- [ ] Confirm Prince Suite Seaview base rate (bot data said 2,590฿; April FB post said 2,800฿)
- [ ] Change ADMIN_PASSWORD from initial value; store secrets in a password manager

## Next iterations
- [ ] Vector search (pgvector on Supabase) behind `retrieveKnowledge` interface
- [ ] LLM-based intent fallback for messages the rule-based detector marks `other`
- [ ] Booking-details slot filling → prefill `booking_requests` (dates/guests parsing)
- [ ] Upstash Redis rate limiting (multi-instance safe)
- [ ] LINE notify / email alerts: HOT lead, human handoff, promotion expiring, system error
- [ ] A/B testing framework for CTA text and promotion messages
- [ ] DB-backed integration tests with DATABASE_URL_TEST in CI
- [ ] Image/location message handling in webhook
- [ ] PDPA data-retention job (purge old conversations per policy)
- [ ] Booking engine Availability/Rate API integration when available
