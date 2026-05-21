# Team Chikesh Financial Coach

Private, mobile-first personal finance coach for Harsh and Anubhuti.

## Current Slice

- Next.js App Router + TypeScript + Tailwind
- Simple passcode gate with an httpOnly cookie
- Prisma schema and seed data for Harsh, Anubhuti, accounts, and basic rules
- Trips/events flow: create event, add expenses, mark ended, see charts
- Records flow: wealth snapshots, liabilities, manual income/expense records
- Dashboard and monthly report calculations
- Coach chat that answers initial event/monthly/net-worth questions from database totals

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run db:push
npm run db:seed
npm run dev
```

For local development, set:

```env
DATABASE_URL="file:./dev.db"
APP_PASSCODE="your-private-passcode"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
APP_BASE_URL="http://localhost:3000"
```

If `APP_PASSCODE` is missing, the dev fallback passcode is `dev-passcode`.

## OpenAI API Key

1. Create an API key from the OpenAI dashboard.
2. Put it only in local/server env files:

```env
OPENAI_API_KEY="your_api_key_here"
OPENAI_MODEL="gpt-5.4-mini"
```

3. Restart the dev server after changing `.env.local`.

Do not use `NEXT_PUBLIC_OPENAI_API_KEY`. The key must stay server-side.

## Security Notes

- Do not commit `.env.local`.
- Do not expose `OPENAI_API_KEY` to the browser.
- Do not use `NEXT_PUBLIC_OPENAI_API_KEY`.
- Store only parsed statement rows; raw statement upload handling should delete files after parsing.
- Credit card payments, transfers, investments, refunds, and duplicates are excluded from lifestyle expense totals.

## Deployment Notes

The current local datasource uses SQLite so the first product loop runs without a Neon database. Before Vercel deployment, switch `prisma/schema.prisma` datasource provider to `postgresql`, set `DATABASE_URL` to the Neon pooled URL, then run Prisma migration/deploy.
