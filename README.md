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
- CSV/XLSX statement upload with rule-based classification and basic duplicate handling

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

For local development, set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
APP_PASSCODE="your-private-passcode"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
APP_BASE_URL="http://localhost:3000"
```

The main app schema uses Postgres so local and production behave the same way. Use a Neon dev branch or a local Postgres database for development.

If `APP_PASSCODE` is missing in development, the fallback passcode is `dev-passcode`. In production, missing `APP_PASSCODE` means nobody can log in.

## OpenAI API Key

1. Create an API key from the OpenAI dashboard.
2. Put it only in local/server env files:

```env
OPENAI_API_KEY="your_api_key_here"
OPENAI_MODEL="gpt-5.4-mini"
```

3. Restart the dev server after changing `.env.local`.

Do not use `NEXT_PUBLIC_OPENAI_API_KEY`. The key must stay server-side.

## Statement Upload

The MVP parser supports CSV/XLSX files with common columns:

- Date: `Date`, `Transaction Date`, `Txn Date`, `Value Date`, `Posted Date`
- Description: `Description`, `Narration`, `Particulars`, `Details`, `Merchant`, `Remarks`
- Amount: either one `Amount` column or separate `Debit`/`Credit` columns

Classification is deterministic for now. Rules and heuristics handle common cases like food spends, credit card payments, SIP/mutual fund investments, refunds, transfers, and salary. Unknown or low-confidence rows are marked for review.

## Security Notes

- Do not commit `.env.local`.
- Do not expose `OPENAI_API_KEY` to the browser.
- Do not use `NEXT_PUBLIC_OPENAI_API_KEY`.
- Store only parsed statement rows; raw statement upload handling should delete files after parsing.
- Credit card payments, transfers, investments, refunds, and duplicates are excluded from lifestyle expense totals.

## Deployment Notes

This app is prepared for Vercel + Neon Postgres.

### Required Production Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
APP_PASSCODE="long-private-passcode"
APP_BASE_URL="https://your-vercel-domain.vercel.app"
OPENAI_API_KEY=""
OPENAI_MODEL="gpt-5.4-mini"
```

OpenAI is optional for now. If `OPENAI_API_KEY` is empty, deterministic features still work and AI summary routes return a clear configuration message.

### First Production Deploy

1. Create a Neon Postgres project.
2. Copy the pooled connection string into Vercel as `DATABASE_URL`.
3. Set `APP_PASSCODE` to a strong private passcode.
4. Import this GitHub repo into Vercel.
5. Keep the build command as `npm run build`.
6. After the first deploy, run migrations and seed against production:

```bash
DATABASE_URL="your-neon-url" npm run db:migrate
DATABASE_URL="your-neon-url" npm run db:seed
```

7. Visit `/api/health` on the deployed URL. It should return `ok: true`.
8. Log in, create a test event, add one expense, end it, and verify charts.

### Production Notes

- Use `npm run db:migrate` for production migrations.
- Do not use `db:push` on production data.
- Do not commit `.env.local`.
- Raw uploaded files are parsed in memory and not stored.
