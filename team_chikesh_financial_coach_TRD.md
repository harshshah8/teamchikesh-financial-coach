# Team Chikesh Financial Coach — Technical Requirements Document (TRD)

## 0. Product Vision

Build a simple, mobile-first, password-protected personal finance coach app for **Harsh and Anubhuti**.

The app should become a private one-stop place for:

- Monthly income / inflow
- Expenses
- Credit card spends
- Credit card bill payments
- Investments
- Manual wealth snapshots
- Liabilities
- Trips / events
- Monthly reports
- AI-generated financial insights
- AI coach chat

The goal is **not** to build a fintech product. There should be **no bank API integration, no account-linking, no auto-fetching from banks, and no regulated financial-data aggregation**. The product should remain a private personal finance coach where Harsh manually uploads statements/records and the app organizes them.

The goal is:

> We dump financial data. The system organizes it. AI explains it. We make better financial decisions.

The app should feel like:

> A private financial coach for Harsh and Anubhuti.

---

## 1. Core Product Principles

### 1.1 Keep It Simple

The app must be usable by a non-tech person.

Anubhuti should be able to use it from phone without understanding technical concepts.

Avoid technical labels in UI like:

- `treatment`
- `duplicate reconciliation`
- `source_file_id`
- `classification confidence`

Use simple labels:

- Add Trip Expense
- Create Trip
- Upload Statement
- Add Wealth Record
- View Report
- Ask Coach

---

### 1.2 AI-Heavy, But Database Is Source of Truth

AI should be used heavily for:

- Transaction categorization
- Intent understanding
- Duplicate detection reasoning
- Trip/event summaries
- Monthly report summaries
- Financial coaching
- Chat answers

But AI should **not invent numbers**.

For every question:

```text
User question
→ AI/backend understands intent
→ Backend fetches real data
→ Backend calculates numbers
→ AI explains the calculated result
```

Example:

User asks:

```text
How much did Goa trip cost?
```

Correct flow:

```text
Find GOA - 2026 event
Fetch linked transactions
Exclude duplicates
Calculate total
Generate AI answer
Render charts
```

Wrong flow:

```text
Send question directly to AI and let it guess
```

---

## 2. Tech Stack

Use this stack for fast implementation:

```text
Framework: Next.js App Router
Language: TypeScript
Styling: Tailwind CSS
Database ORM: Prisma
Database: Neon Postgres
Charts: Recharts
AI SDK: OpenAI Node SDK
Auth: Simple passcode gate for MVP
Deployment: Vercel
File parsing: CSV/XLSX first
```

Reasoning:

- Next.js gives app + API in one project.
- Vercel deployment is easy.
- Neon Postgres works well with Vercel.
- Recharts is enough for visuals.
- OpenAI API powers the coach.

---

## 3. Estimated Build Time With Codex / AI Coding Agent

Assuming Codex or another agent does most implementation and Harsh reviews/adjusts:

### MVP 0: Local Working Prototype

Estimated: **4–8 hours**

Includes:

- Next.js app setup
- Database models
- Password gate
- Seed Harsh/Anubhuti
- Create trip
- Add trip expenses
- End trip
- Trip summary charts
- Manual wealth records
- Basic dashboard

### MVP 1: AI-Enabled Version

Estimated: **1–2 days**

Includes:

- OpenAI API integration
- AI chat
- AI trip summary
- AI monthly report summary
- AI transaction categorization
- Basic duplicate detection

### MVP 2: Deployable Private App

Estimated: **1 additional day**

Includes:

- Neon Postgres
- Vercel deployment
- Environment variables
- Production migration
- Basic README

### Realistic Total

```text
Best case: 1 day
Comfortable: 2–3 days
Polished: 4–5 days
```

Do not aim for perfect statement parsing in v1. That can consume too much time.

---

## 4. Authentication / Password Protection

### MVP Approach

Use a simple shared passcode gate.

Only people with the passcode can access the app.

Store passcode in environment variable:

```env
APP_PASSCODE=some-strong-private-passcode
```

When user opens the app:

```text
Show login screen
Ask for passcode
If correct, set secure httpOnly cookie
Allow access
```

Cookie requirements:

```text
Name: finance_auth
httpOnly: true
secure: true in production
sameSite: lax
maxAge: 30 days
```

This is enough for MVP because only Harsh and Anubhuti will use it.

Do not hardcode the password in code.

### Later Upgrade

Later, replace this with Auth.js / NextAuth Credentials Provider.

For now, do not over-engineer authentication.

---

## 5. Environment Variables

Create `.env.example`:

```env
DATABASE_URL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5-mini
APP_PASSCODE=
APP_BASE_URL=http://localhost:3000
```

Create `.env.local` locally:

```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="your_openai_api_key_here"
OPENAI_MODEL="gpt-5.5-mini"
APP_PASSCODE="your-private-passcode"
APP_BASE_URL="http://localhost:3000"
```

Important:

- Never commit `.env.local`.
- Never expose `OPENAI_API_KEY` in frontend.
- Never name it `NEXT_PUBLIC_OPENAI_API_KEY`.
- Never log full uploaded statements.
- Never log OpenAI API key.

Add to `.gitignore`:

```gitignore
.env
.env.local
uploads/
```

---

## 6. App Navigation

Mobile-first bottom navigation:

```text
Home
Trips
Records
Reports
Coach
```

Secondary/admin page:

```text
Upload
Settings
```

For Anubhuti, primary usage should be:

```text
Trips → Add Expense
Records → Add Wealth Record if needed
Reports → View summary
Coach → Ask question
```

For Harsh, additional usage:

```text
Upload statements
Review unknown transactions
Generate monthly report
```

---

## 7. Pages and Features

---

### 7.1 Home Dashboard

Route:

```text
/
```

Show current month summary.

Cards:

- Net Worth
- Monthly Income
- Monthly Expenses
- Monthly Investments
- Savings Rate
- Credit Card Outstanding
- Active Trips / Events
- AI Insight

Example UI:

```text
June 2026

Net Worth: ₹28.4L
Income: ₹3.1L
Expenses: ₹1.45L
Investments: ₹95K
Savings Rate: 42%
Credit Card Outstanding: ₹82K

Active Event:
GOA - 2026
Current Spend: ₹38,500
```

Charts:

- Expense by category
- Income vs expenses vs investments
- Net worth trend

---

### 7.2 Trips / Events

Route:

```text
/events
```

Purpose:

- Create trips/events
- Add expenses from phone
- End event
- Generate event summary

#### Create Event Form

Fields:

- Event name
- Event type
- Start date
- Budget optional
- People: Harsh, Anubhuti default

Event types:

- Trip
- House Setup
- Family Function
- Medical
- Wedding
- Other

Example:

```text
GOA - 2026
Type: Trip
Status: Active
```

#### Active Event Detail Page

Route:

```text
/events/[id]
```

Show:

- Event name
- Current spend
- Paid by Harsh
- Paid by Anubhuti
- Category breakdown
- Add expense button
- End event button

#### Add Event Expense Form

Mobile-friendly form.

Fields:

- Paid by: Harsh / Anubhuti
- Amount
- Category
- Payment mode
- Date default today
- Notes

Categories for event:

- Food
- Travel
- Stay
- Shopping
- Activity
- Cash
- Other

Payment mode:

- Cash
- UPI
- Credit Card
- Debit Card
- Other

When saved, create a transaction:

```text
source = MANUAL_EVENT
event_id = selected event
treatment = EXPENSE
```

#### End Event

Button:

```text
Mark Event as Ended
```

On click:

```text
Set status = ENDED
Set end_date = today if missing
Generate AI event summary
Save ai_summary on event
Show event report
```

#### Event Summary

Show:

- Total spend
- Paid by person
- Category chart
- Daily spend chart
- Payment mode chart
- AI summary
- Possible duplicate warnings

---

### 7.3 Records

Route:

```text
/records
```

Purpose:

Generic manual entries.

Use this for:

- Wealth Snapshot
- Investment Update
- Liability
- Manual Expense
- Income
- Transfer
- Refund
- Note

#### Add Record Form

Fields:

- Month
- Owner: Harsh / Anubhuti / Shared
- Record type
- Category / Asset type
- Platform / Account
- Amount
- Is liability?
- Notes

Record types:

- Wealth Snapshot
- Investment Update
- Liability
- Manual Expense
- Income
- Transfer
- Refund
- Note

Examples:

```text
Month: June 2026
Owner: Harsh
Record Type: Wealth Snapshot
Asset Type: Mutual Fund
Platform: Groww
Amount: ₹8,00,000
```

```text
Month: June 2026
Owner: Anubhuti
Record Type: Wealth Snapshot
Asset Type: Bank Balance
Amount: ₹1,20,000
```

```text
Month: June 2026
Owner: Harsh
Record Type: Liability
Asset Type: Credit Card Outstanding
Amount: ₹60,000
Is liability: true
```

---

### 7.4 Upload Statements

Route:

```text
/upload
```

Purpose:

Monthly upload of bank/credit card statements.

For MVP, support:

- CSV
- XLSX

PDF can come later.

Upload form:

- Owner
- Account
- Statement month
- File

After upload:

```text
Parse file
Normalize transactions
Apply rules
Use AI for unknown categorization
Detect duplicates
Save parsed transactions
Show review screen
```

#### Important Statement Logic

Credit card purchase:

```text
Count as Expense on purchase date
```

Credit card bill payment:

```text
Treatment = CREDIT_CARD_PAYMENT
Do not count as expense
```

Example:

```text
Swiggy ₹500 = Expense
Zomato ₹500 = Expense
Credit card bill payment ₹1000 = Credit Card Payment
Monthly spending = ₹1000, not ₹2000
```

Investments:

```text
Treatment = INVESTMENT
Track separately from lifestyle expenses
```

Transfers:

```text
Harsh to Anubhuti = TRANSFER
Own account to own account = TRANSFER
Not expense
```

Refunds:

```text
Treatment = REFUND
Reduce expense
```

---

### 7.5 Monthly Reports

Route:

```text
/reports
```

User selects month.

Show:

- Income
- Expenses
- Investments
- Savings
- Net worth movement
- Credit card payments ignored
- Trips/events in that month
- Top categories
- AI recommendations

Monthly report should have:

- Executive summary
- Category breakdown
- Household vs personal
- Paid by person
- Investments
- Wealth movement
- Trip/event summary
- Action items

Example:

```text
June 2026 Summary

Income: ₹3.1L
Expenses: ₹1.45L
Investments: ₹95K
Savings Rate: 42%
Net Worth Change: +₹1.2L

Trips:
GOA - 2026: ₹52,400

AI Insight:
GOA was a planned one-time expense. Food delivery was higher than groceries this month. Credit card payments were excluded from expenses, so spending is not double-counted.
```

---

### 7.6 AI Coach Chat

Route:

```text
/coach
```

This is the main AI-heavy feature.

User can ask:

- How much did Goa trip cost?
- How much did we spend this month?
- What is our current net worth?
- Are we saving enough?
- What are our top spending categories?
- How much did Harsh pay in Goa?
- How much did Anubhuti pay in Goa?
- Can we afford a ₹2L trip in December?
- What should we improve next month?

AI should answer from database.

If data is missing:

```text
I don’t have enough data for this yet. Please upload June statements or add the wealth snapshot.
```

---

## 8. Database Schema

Use Prisma.

---

### 8.1 User

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  role      String?
  createdAt DateTime @default(now())

  accounts      Account[]
  transactions  Transaction[]
  wealthRecords WealthRecord[]
}
```

Seed users:

```text
Harsh
Anubhuti
```

---

### 8.2 Account

```prisma
model Account {
  id           String   @id @default(cuid())
  ownerId      String
  owner        User     @relation(fields: [ownerId], references: [id])
  name         String
  type         AccountType
  institution  String?
  purpose      String?
  statementDay Int?
  dueDay       Int?
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())

  transactions Transaction[]
  uploads      StatementUpload[]
}

enum AccountType {
  BANK
  CREDIT_CARD
  INVESTMENT
  CASH
  OTHER
}
```

Seed accounts:

```text
Harsh Bank
Harsh Credit Card 1
Harsh Credit Card 2
Harsh Credit Card 3
Anubhuti Bank
Anubhuti Credit Card
```

---

### 8.3 Event

```prisma
model Event {
  id        String      @id @default(cuid())
  name      String
  type      EventType
  startDate DateTime?
  endDate   DateTime?
  budget    Decimal?
  status    EventStatus @default(ACTIVE)
  aiSummary String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  transactions Transaction[]
}

enum EventType {
  TRIP
  HOUSE_SETUP
  FAMILY_FUNCTION
  MEDICAL
  WEDDING
  OTHER
}

enum EventStatus {
  ACTIVE
  ENDED
  ARCHIVED
}
```

---

### 8.4 Transaction

```prisma
model Transaction {
  id          String   @id @default(cuid())
  date        DateTime
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  accountId   String?
  account     Account? @relation(fields: [accountId], references: [id])

  eventId     String?
  event       Event?   @relation(fields: [eventId], references: [id])

  amount      Decimal
  direction   TransactionDirection
  description String?
  merchant    String?

  category    String?
  subcategory String?
  treatment   Treatment
  expenseType ExpenseType?
  paymentMode PaymentMode?
  source      TransactionSource

  sourceFileId String?
  sourceFile   StatementUpload? @relation(fields: [sourceFileId], references: [id])

  confidence  Float?
  duplicateOfTransactionId String?
  notes       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum TransactionDirection {
  DEBIT
  CREDIT
}

enum Treatment {
  EXPENSE
  INCOME
  INVESTMENT
  TRANSFER
  CREDIT_CARD_PAYMENT
  REFUND
  LIABILITY
  WEALTH_SNAPSHOT
  DUPLICATE
  UNKNOWN
}

enum ExpenseType {
  HOUSEHOLD
  PERSONAL_HARSH
  PERSONAL_ANUBHUTI
  TRAVEL
  FAMILY
  HEALTH
  INVESTMENT
  INCOME
  TRANSFER
}

enum PaymentMode {
  CASH
  UPI
  CREDIT_CARD
  DEBIT_CARD
  BANK_TRANSFER
  OTHER
}

enum TransactionSource {
  STATEMENT
  MANUAL_EVENT
  MANUAL_RECORD
  AI_GENERATED
}
```

---

### 8.5 WealthRecord

```prisma
model WealthRecord {
  id          String   @id @default(cuid())
  month       String
  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  recordType  String
  assetType   String
  platform    String?
  amount      Decimal
  isLiability Boolean  @default(false)
  notes       String?

  createdAt   DateTime @default(now())
}
```

---

### 8.6 StatementUpload

```prisma
model StatementUpload {
  id          String   @id @default(cuid())
  ownerId     String
  accountId   String
  account     Account @relation(fields: [accountId], references: [id])

  month       String
  fileName    String
  fileType    String
  status      UploadStatus @default(UPLOADED)

  uploadedAt  DateTime @default(now())
  processedAt DateTime?

  transactions Transaction[]
}

enum UploadStatus {
  UPLOADED
  PARSED
  NEEDS_REVIEW
  COMPLETED
  FAILED
}
```

---

### 8.7 Rule

```prisma
model Rule {
  id          String   @id @default(cuid())
  keyword     String
  merchant    String?
  category    String
  subcategory String?
  treatment   Treatment
  expenseType ExpenseType?
  priority    Int      @default(100)
  createdAt   DateTime @default(now())
}
```

---

## 9. AI Architecture

### 9.1 AI Routes

Create AI routes:

```text
POST /api/ai/categorize-transaction
POST /api/ai/event-summary
POST /api/ai/monthly-summary
POST /api/ai/chat
```

Optional later:

```text
POST /api/ai/detect-intent
```

---

### 9.2 AI Service File

Create:

```text
/lib/ai/openai.ts
```

Responsibilities:

- Initialize OpenAI client
- Read `OPENAI_API_KEY` from `process.env`
- Expose helper `generateJson()`
- Expose helper `generateText()`

Important:

- Throw clear error if `OPENAI_API_KEY` is missing.
- Never call OpenAI from client components.
- Never expose API key to browser.

---

### 9.3 AI Model

Use env:

```env
OPENAI_MODEL=gpt-5.5-mini
```

All AI calls should use:

```ts
process.env.OPENAI_MODEL || "gpt-5.5-mini"
```

---

## 10. AI Prompt: Transaction Categorization

System prompt:

```text
You are the financial transaction classifier for Harsh and Anubhuti.

Classify the transaction into JSON only.

Core rules:
1. Credit card purchases are expenses on transaction date.
2. Credit card bill payments are not expenses. Mark them as CREDIT_CARD_PAYMENT.
3. Transfers between Harsh and Anubhuti are not expenses. Mark them as TRANSFER.
4. Investments are not lifestyle expenses. Mark them as INVESTMENT.
5. Refunds should be marked as REFUND.
6. If unsure, mark treatment as UNKNOWN and confidence below 0.7.
7. Do not invent details.

Allowed treatments:
EXPENSE, INCOME, INVESTMENT, TRANSFER, CREDIT_CARD_PAYMENT, REFUND, LIABILITY, DUPLICATE, UNKNOWN

Allowed expense types:
HOUSEHOLD, PERSONAL_HARSH, PERSONAL_ANUBHUTI, TRAVEL, FAMILY, HEALTH, INVESTMENT, INCOME, TRANSFER

Return JSON only:
{
  "merchant": string,
  "category": string,
  "subcategory": string,
  "treatment": string,
  "expenseType": string,
  "confidence": number,
  "reason": string
}
```

---

## 11. AI Prompt: Financial Coach Chat

System prompt:

```text
You are the private financial coach for Harsh and Anubhuti.

Your role:
- Explain their income, expenses, investments, liabilities, trips, and net worth.
- Give clear and practical advice.
- Be calm, non-judgmental, and actionable.
- Do not create guilt.
- Focus on growing net worth and financial clarity.

Rules:
1. Use only the provided data.
2. Never invent numbers.
3. If data is missing, say what is missing.
4. Credit card bill payments are not expenses.
5. Credit card purchases are expenses.
6. Transfers are not expenses.
7. Investments are tracked separately from lifestyle expenses.
8. Refunds reduce expenses.
9. Mention one-time expenses separately from normal lifestyle expenses.
10. Keep answers concise but useful.
```

---

## 12. AI Chat Flow

When user asks a question:

```text
Question
→ Detect intent
→ Fetch relevant DB data
→ Calculate numbers
→ Send calculated data to AI
→ Return answer + chart data
```

Supported intents:

- EVENT_SUMMARY
- MONTHLY_SUMMARY
- NET_WORTH
- CATEGORY_SPEND
- SAVINGS_RATE
- INVESTMENT_SUMMARY
- CREDIT_CARD_SUMMARY
- AFFORDABILITY
- GENERAL_ADVICE
- UNKNOWN

---

### Example: “How much did Goa trip cost?”

Sequence:

```text
User asks: How much did Goa trip cost?
API receives question
AI/code detects EVENT_SUMMARY intent
Backend fuzzy matches event name Goa
DB returns GOA - 2026
Backend fetches transactions for event
Backend excludes duplicates
Backend sums total
Backend groups by category, owner, date, payment mode
Backend sends calculated summary to AI
AI writes natural answer
Frontend renders answer + charts
```

Pseudo query:

```sql
SELECT *
FROM transactions
WHERE event_id = $eventId
AND treatment = 'EXPENSE'
AND duplicate_of_transaction_id IS NULL;
```

---

## 13. Duplicate Detection

This is important for trip entries + statement uploads.

### Problem

During trip:

```text
Manual event entry:
Harsh ₹1200 airport cab
```

Later statement:

```text
OLA CABS ₹1200
```

Do not double count.

### Duplicate Detection Rule

Possible duplicate if:

- Same owner
- Same amount
- Date within ±2 days
- Similar category or merchant/notes
- One source is `MANUAL_EVENT` and other source is `STATEMENT`

When detected:

```text
Prefer statement transaction for accounting.
Mark manual_event transaction as duplicate.
Keep manual entry notes as context.
```

User-friendly review text:

```text
This looks already added in GOA - 2026.

Manual:
Harsh ₹1200 airport cab

Statement:
Harsh ₹1200 OLA CABS

Count it once?

[Yes, count once]
[No, keep both]
```

---

## 14. Statement Upload Processing

### 14.1 MVP Support

Support CSV/XLSX only.

Do not support PDF in v1 unless easy.

### 14.2 Processing Steps

```text
Upload file
Parse rows
Normalize columns
Apply rule engine
AI categorize unknown rows
Detect duplicates
Save transactions
Show review screen
```

### 14.3 Normalized Transaction Shape

```ts
type NormalizedTransaction = {
  date: string;
  description: string;
  amount: number;
  direction: "DEBIT" | "CREDIT";
  ownerId: string;
  accountId: string;
  source: "STATEMENT";
};
```

### 14.4 Basic Parser Requirement

Because every bank/card statement has different columns, build a simple column mapping step.

After upload, show detected columns and ask user to map:

- Date column
- Description column
- Amount column
- Debit column optional
- Credit column optional

For MVP, also support one simple sample format automatically.

---

## 15. Reports and Calculations

### 15.1 Monthly Expenses

Monthly expenses should include:

```text
treatment = EXPENSE
duplicateOfTransactionId IS NULL
date in selected month
```

Exclude:

```text
CREDIT_CARD_PAYMENT
TRANSFER
INVESTMENT
DUPLICATE
INCOME
LIABILITY
```

---

### 15.2 Monthly Income

Include:

```text
treatment = INCOME
```

---

### 15.3 Monthly Investments

Include:

```text
treatment = INVESTMENT
```

---

### 15.4 Savings Rate

Formula:

```text
Savings Rate = (Income - Expenses) / Income * 100
```

Also show:

```text
Investment Rate = Investments / Income * 100
```

---

### 15.5 Net Worth

From latest wealth records for selected month:

```text
Net Worth = Sum(assets) - Sum(liabilities)
```

Where:

```text
isLiability = false → asset
isLiability = true → liability
```

---

## 16. Chart Requirements

Charts are generated by code, not AI.

Use Recharts.

Dashboard charts:

- Expense by category: Pie/Donut
- Income vs Expense vs Investment: Bar
- Net Worth trend: Line

Trip charts:

- Category breakdown: Pie
- Paid by person: Bar
- Daily spend: Bar/Line
- Payment mode: Pie

Monthly report charts:

- Top categories
- Month-over-month expense trend
- Net worth movement

AI returns text and optionally labels, but chart data should come from DB calculations.

---

## 17. UI Design Requirements

### Style

- Mobile-first
- Clean cards
- Large buttons
- Minimal inputs
- Soft colors
- No clutter
- Bottom navigation

### Primary Actions

Home:

- Add Trip Expense
- Add Wealth Record
- Upload Statement
- Ask Coach
- View Report

Trips page:

- Create Event
- Add Expense
- End Event
- View Summary

Records page:

- Add Wealth Snapshot
- Add Liability
- Add Investment Update

Coach page:

- Chat input
- Suggested questions
- Answer cards
- Charts if applicable

Suggested questions:

- How much did we spend this month?
- How much did GOA - 2026 cost?
- What is our net worth?
- Are we saving enough?
- What should we improve next month?

---

## 18. Deployment Plan

### 18.1 Local Setup Commands

```bash
npx create-next-app@latest finance-coach --typescript --tailwind --eslint --app
cd finance-coach
npm install prisma @prisma/client
npm install openai
npm install recharts
npm install xlsx papaparse
npm install bcryptjs
npm install lucide-react
npx prisma init
```

Set `.env.local`:

```env
DATABASE_URL="postgresql://..."
OPENAI_API_KEY="your_key_here"
OPENAI_MODEL="gpt-5.5-mini"
APP_PASSCODE="your_private_passcode"
APP_BASE_URL="http://localhost:3000"
```

Run:

```bash
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

---

### 18.2 Neon Database

Steps:

```text
Create Neon project
Copy pooled DATABASE_URL
Paste into .env.local
Paste into Vercel env vars later
Run Prisma migration
```

---

### 18.3 Vercel Deployment

Steps:

```text
Push code to GitHub
Go to Vercel
Import GitHub repo
Set framework as Next.js
Add environment variables
Deploy
```

Add these env vars in Vercel Project Settings:

```env
DATABASE_URL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5-mini
APP_PASSCODE=
APP_BASE_URL=https://your-vercel-url.vercel.app
```

Build command:

```bash
npm run build
```

Install command:

```bash
npm install
```

Add to `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate deploy",
    "db:seed": "prisma db seed"
  }
}
```

After first deploy, run migration:

```bash
npx prisma migrate deploy
```

---

## 19. Security Requirements

Because this app contains financial data:

- Do not log full statements.
- Do not log OpenAI API key.
- Do not expose API key to browser.
- Do not commit `.env.local`.
- Mask account numbers.
- Delete uploaded files after parsing.
- Store only parsed transactions.
- Use HTTPS deployment.
- Use passcode gate.

For MVP:

```text
Parse uploaded file
Save transactions
Delete raw file immediately
```

Later optional:

```text
Store encrypted files in S3/R2
```

---

## 20. Folder Structure

```text
finance-coach/
  app/
    page.tsx
    login/page.tsx
    events/page.tsx
    events/[id]/page.tsx
    records/page.tsx
    upload/page.tsx
    reports/page.tsx
    coach/page.tsx
    api/
      auth/login/route.ts
      auth/logout/route.ts
      ai/chat/route.ts
      ai/categorize-transaction/route.ts
      ai/event-summary/route.ts
      ai/monthly-summary/route.ts
      events/route.ts
      transactions/route.ts
      records/route.ts
      upload/route.ts

  components/
    BottomNav.tsx
    DashboardCard.tsx
    ChartCard.tsx
    EventExpenseForm.tsx
    WealthRecordForm.tsx
    CoachChat.tsx
    LoginForm.tsx

  lib/
    prisma.ts
    auth.ts
    calculations/
      monthly.ts
      event.ts
      wealth.ts
    ai/
      openai.ts
      prompts.ts
      classify.ts
      coach.ts
    parsing/
      csv.ts
      xlsx.ts
      normalize.ts
    duplicates/
      detectDuplicate.ts
    formatting/
      money.ts
      dates.ts

  prisma/
    schema.prisma
    seed.ts

  .env.example
  README.md
```

---

## 21. Codex Implementation Phases

### Phase 1: Project Skeleton

Build:

- Next.js app
- Tailwind
- Prisma
- Neon/Postgres support
- Password gate
- Bottom navigation
- Seed users/accounts

Acceptance:

- App opens
- Login passcode works
- Dashboard loads
- Harsh/Anubhuti exist

---

### Phase 2: Trips/Events

Build:

- Create event
- Add event expense
- End event
- Event summary
- Charts

Acceptance:

- Create GOA - 2026
- Add expenses from phone UI
- End trip
- See total/category/paid-by charts

---

### Phase 3: Records/Wealth

Build:

- Add wealth snapshot
- Add liability
- Show net worth
- Net worth trend

Acceptance:

- Add Harsh MF value
- Add Anubhuti bank balance
- Add credit card outstanding
- Net worth calculates correctly

---

### Phase 4: Upload Statements

Build:

- Upload CSV/XLSX
- Map columns
- Normalize rows
- Apply simple rules
- Save transactions

Acceptance:

- Upload sample statement
- Transactions appear
- Credit card payment is not counted as expense

---

### Phase 5: AI Integration

Build:

- Transaction categorization
- AI event summary
- AI monthly report
- AI chat

Acceptance:

- Ask: How much did Goa trip cost?
- System fetches event data
- AI answers with actual total
- Charts shown

---

### Phase 6: Deployment

Build:

- README
- `.env.example`
- Vercel deployment
- Neon DB
- Production env vars

Acceptance:

- App deployed
- Password protected
- OpenAI key works
- Data persists

---

## 22. Paste-Ready Agent Prompt

Use this prompt for Codex or any coding agent:

```text
Build a simple mobile-first password-protected personal finance coach app for a married couple: Harsh and Anubhuti.

Product name: Team Chikesh Financial Coach.

Goal:
The app should act as a private AI-heavy financial coach. It should track inflow, expenses, investments, liabilities, manual wealth snapshots, trips/events, and generate monthly reports and AI coaching insights.

The app should be simple enough for Anubhuti, who is from a non-tech background, to use from phone.

Tech stack:
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- Neon Postgres
- Recharts
- OpenAI Node SDK
- CSV/XLSX parsing using papaparse/xlsx
- Deployable on Vercel

Important:
- Do not over-engineer.
- Do not build bank API integrations.
- Do not build mobile app.
- Do not support PDF parsing in v1 unless easy.
- Support CSV/XLSX statement upload first.
- Charts should be generated from database aggregations, not by AI.
- AI should explain, categorize, summarize, and coach.
- Database is source of truth.
- AI must not invent numbers.

Authentication:
Implement simple app-level passcode protection.
Use APP_PASSCODE from environment variable.
Show login page if not authenticated.
On correct passcode, set secure httpOnly cookie.
Protect all app routes and API routes except login.
Do not hardcode passcode.

Environment variables:
Create .env.example with:
DATABASE_URL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5-mini
APP_PASSCODE=
APP_BASE_URL=http://localhost:3000

Never expose OPENAI_API_KEY to frontend.
Never use NEXT_PUBLIC_OPENAI_API_KEY.
Read OpenAI key only in server-side route handlers.

Core screens:
1. Home Dashboard
2. Trips / Events
3. Records
4. Upload Statements
5. Monthly Reports
6. AI Coach Chat
7. Settings optional

Navigation:
Use mobile-first bottom navigation:
Home, Trips, Records, Reports, Coach.
Upload can be accessible from Home or Settings.

Database models:
Use Prisma models:
- User
- Account
- Event
- Transaction
- WealthRecord
- StatementUpload
- Rule

Seed users:
- Harsh
- Anubhuti

Seed accounts:
- Harsh Bank
- Harsh Credit Card 1
- Harsh Credit Card 2
- Harsh Credit Card 3
- Anubhuti Bank
- Anubhuti Credit Card

Transaction treatment enum:
- EXPENSE
- INCOME
- INVESTMENT
- TRANSFER
- CREDIT_CARD_PAYMENT
- REFUND
- LIABILITY
- WEALTH_SNAPSHOT
- DUPLICATE
- UNKNOWN

Core money rules:
1. Credit card purchases count as expenses on transaction date.
2. Credit card bill payments do not count as expenses. Mark as CREDIT_CARD_PAYMENT.
3. Transfers between Harsh and Anubhuti are not expenses. Mark as TRANSFER.
4. Investments are tracked separately. Mark as INVESTMENT.
5. Refunds reduce expenses. Mark as REFUND.
6. Duplicates must not be counted in totals.

Trips / Events:
Allow user to create an event like GOA - 2026.
Fields:
- name
- type: TRIP, HOUSE_SETUP, FAMILY_FUNCTION, MEDICAL, WEDDING, OTHER
- start date
- optional budget
- status: ACTIVE, ENDED, ARCHIVED

Inside an active event, provide a mobile-friendly expense form:
- paid by: Harsh / Anubhuti
- amount
- category: Food, Travel, Stay, Shopping, Activity, Cash, Other
- payment mode: Cash, UPI, Credit Card, Debit Card, Other
- notes
- date default today

When event expense is added, create a Transaction:
- source = MANUAL_EVENT
- treatment = EXPENSE
- event_id = selected event

When user marks event ended:
- status = ENDED
- end_date = today if missing
- calculate event totals
- generate AI event summary
- show event report

Event report should show:
- total spend
- paid by Harsh vs Anubhuti
- category breakdown chart
- daily spend chart
- payment mode split
- AI-generated summary
- duplicate warning if applicable

Records:
Create a generic record entry page.
Record types:
- Wealth Snapshot
- Investment Update
- Liability
- Manual Expense
- Income
- Transfer
- Refund
- Note

Fields:
- month
- owner
- record type
- asset/category
- platform/account
- amount
- is liability
- notes

Use WealthRecord table for wealth/liability records.
Use Transaction table for manual expenses/income/transfer/refund if needed.

Upload Statements:
Allow file upload with:
- owner
- account
- month
- file

Support CSV and XLSX.
After upload:
1. Parse rows.
2. Normalize to date, description, amount, direction.
3. Apply rules.
4. Use AI to categorize unknown transactions.
5. Detect duplicates against manual event entries.
6. Save transactions.
7. Show review screen for UNKNOWN or low-confidence items.

Column mapping:
If parser cannot detect columns, show simple mapping UI:
- Date column
- Description column
- Amount column
- Debit column optional
- Credit column optional

Duplicate detection:
Possible duplicate if:
- same owner
- same amount
- date within plus/minus 2 days
- similar merchant/category/notes
- one source is statement and one source is manual_event

If duplicate found:
- Prefer statement transaction for accounting.
- Mark manual event transaction as duplicate by setting duplicateOfTransactionId.
- Keep manual notes as context.
- Do not count duplicate in totals.

Monthly Reports:
For selected month, calculate:
- income
- expenses
- investments
- savings rate
- investment rate
- net worth
- net worth change
- credit card payments ignored
- trips/events in that month
- top spending categories
- AI recommendations

Monthly expense calculation:
Include only:
- treatment = EXPENSE
- duplicateOfTransactionId is null
- date in selected month

Exclude:
- CREDIT_CARD_PAYMENT
- TRANSFER
- INVESTMENT
- DUPLICATE
- INCOME
- LIABILITY

Net worth:
Use latest wealth records for month.
Net Worth = assets - liabilities.

AI:
Use OpenAI API from server-side only.

Create AI routes:
- POST /api/ai/categorize-transaction
- POST /api/ai/event-summary
- POST /api/ai/monthly-summary
- POST /api/ai/chat

AI categorization should return JSON:
{
  merchant: string,
  category: string,
  subcategory: string,
  treatment: string,
  expenseType: string,
  confidence: number,
  reason: string
}

AI chat flow:
When user asks a question:
1. Detect intent.
2. Fetch relevant DB data.
3. Calculate numbers in backend.
4. Send calculated summary to AI.
5. AI generates human-friendly answer.
6. Return answer + chart-ready data.

Supported intents:
- EVENT_SUMMARY
- MONTHLY_SUMMARY
- NET_WORTH
- CATEGORY_SPEND
- SAVINGS_RATE
- INVESTMENT_SUMMARY
- CREDIT_CARD_SUMMARY
- AFFORDABILITY
- GENERAL_ADVICE
- UNKNOWN

For event questions like:
- How much did Goa trip cost?
- What was GOA - 2026 expense?
- Show Goa summary

Flow:
1. Fuzzy match event name.
2. Fetch transactions for event.
3. Include only EXPENSE.
4. Exclude duplicates.
5. Calculate total spend, paid by owner, category breakdown, daily spend, payment mode breakdown.
6. Send calculated data to AI.
7. Return answer + chart data.

AI coach prompt:
You are the private financial coach for Harsh and Anubhuti.
Use only provided data.
Never invent numbers.
Credit card bill payments are not expenses.
Credit card purchases are expenses.
Transfers are not expenses.
Investments are separate from lifestyle expenses.
Refunds reduce expenses.
Explain calmly and practically.
Focus on growing net worth and improving financial clarity.

Home Dashboard:
Show:
- Net Worth
- Monthly Income
- Monthly Expenses
- Monthly Investments
- Savings Rate
- Credit Card Outstanding
- Active Trips / Events
- AI Insight

Charts:
Use Recharts.
Charts:
- Expense by category
- Income vs expense vs investment
- Net worth trend
- Trip category breakdown
- Paid by person
- Daily spend

Deployment:
Prepare for Vercel.
Use Neon Postgres.
Create README with:
1. Local setup
2. Env variables
3. How to create OpenAI API key and paste into .env.local
4. How to create Neon DB and paste DATABASE_URL
5. How to deploy on Vercel
6. How to add env vars in Vercel
7. How to run Prisma migrations
8. Security notes

Security:
- Do not log OPENAI_API_KEY.
- Do not log full bank statements.
- Mask account numbers.
- Delete uploaded files after parsing.
- Store only parsed transactions.
- Protect app with passcode.
- Add .env.local to .gitignore.

Acceptance criteria:
1. App runs locally.
2. Login passcode works.
3. Harsh and Anubhuti are seeded.
4. User can create GOA - 2026 event.
5. User can add trip expenses from mobile-friendly form.
6. User can end trip and see summary with charts.
7. User can add monthly wealth records.
8. Dashboard shows net worth, income, expenses, investments, savings rate.
9. User can upload sample CSV/XLSX statement.
10. Statement transactions are categorized.
11. Credit card bill payment is excluded from expenses.
12. Duplicate trip/manual and statement entries are not double counted.
13. AI chat can answer: How much did Goa trip cost?
14. AI monthly report generates summary and recommendations.
15. App can be deployed on Vercel with env vars.
```

---

## 23. First Build Order

Do not start with statement parser.

Start with this order:

```text
1. App skeleton
2. Passcode login
3. DB schema + seed Harsh/Anubhuti
4. Trips/events flow
5. Wealth records
6. Dashboard
7. AI chat over event data
8. Statement upload
9. Monthly report
10. Deployment
```

The first magical moment should be:

```text
Create GOA - 2026
Add expenses from phone
Ask: “How much did Goa trip cost?”
AI answers with real total + chart
```

That proves the product.

---

## 24. MVP Acceptance Criteria Checklist

- [ ] App runs locally with `npm run dev`.
- [ ] Passcode login works.
- [ ] Harsh and Anubhuti are seeded.
- [ ] Basic accounts are seeded.
- [ ] Home dashboard loads.
- [ ] User can create GOA - 2026 event.
- [ ] User can add trip expenses from mobile-friendly form.
- [ ] User can end trip.
- [ ] Event report shows total spend.
- [ ] Event report shows paid by Harsh vs Anubhuti.
- [ ] Event report shows category chart.
- [ ] User can add wealth snapshot.
- [ ] User can add liability.
- [ ] Net worth calculation works.
- [ ] AI chat can answer event cost using database data.
- [ ] Upload CSV/XLSX statement works.
- [ ] Statement transactions are categorized.
- [ ] Credit card bill payments are excluded from expenses.
- [ ] Duplicate manual trip + statement transactions are not double counted.
- [ ] Monthly report calculates income, expenses, investments, savings rate.
- [ ] AI monthly report generates summary and action items.
- [ ] App deploys to Vercel.
- [ ] Neon Postgres is configured.
- [ ] OpenAI API key is configured only server-side.
- [ ] `.env.local` is not committed.

---

## 25. Non-Goals and Permanent Boundaries

### 25.1 Permanent Non-Goal: Do Not Build a Fintech Product

This product must **not** become a fintech/bank-integration product.

Do not build:

- Bank API integrations
- Account aggregator integrations
- UPI auto-sync
- Automatic bank account linking
- Automatic credit card linking
- Automatic investment account linking
- Payment initiation
- Money movement
- Lending/borrowing workflows
- Regulated financial-data aggregation

The app should remain a private, self-hosted/personal-use financial coach where:

```text
Harsh/Anubhuti manually upload statements
Harsh/Anubhuti manually add wealth snapshots
Harsh/Anubhuti manually dump trip/event expenses
AI organizes, explains, summarizes, and coaches
```

The app should help with decision-making, not financial transactions.

---

### 25.2 Non-Goals for V1

Do not build these in V1:

- Mobile native app
- Complex multi-user auth
- PDF parsing perfection
- Investment API sync
- Tax planning
- Loan amortization planning
- Budget envelope system
- WhatsApp bot
- OCR for screenshots
- Multi-currency support
- Public sharing

V1 should focus on:

```text
Trips/events
Manual wealth records
Statement upload
AI categorization
AI chat
Monthly reports
Simple private deployment
```

---

## 26. Future Scope / Roadmap

Future scope should make the app easier to use, more AI-heavy, and more coach-like, but it should still avoid bank integrations.

### 26.1 WhatsApp-Based Expense Dumping

Goal:

```text
Allow Harsh and Anubhuti to add expenses from WhatsApp without opening the app.
```

Example messages:

```text
Harsh 1200 Goa cab
Anu 850 Goa lunch
Paid 3000 maid cash
4200 Amazon kitchen setup
Harsh 1800 dinner GOA - 2026 credit card
```

Expected behavior:

```text
WhatsApp message received
→ AI parses message
→ App identifies owner, amount, event, category, payment mode, notes
→ Transaction is saved as manual_event or manual_record
→ App replies with confirmation
```

Example reply:

```text
Added to GOA - 2026:
Harsh paid ₹1,200 for Travel/Cab.
```

Implementation options:

```text
Option 1: WhatsApp Cloud API
Option 2: Twilio WhatsApp
Option 3: Telegram bot first, WhatsApp later if WhatsApp setup feels heavy
```

Important boundary:

```text
WhatsApp should only be used for manual expense/record dumping and reminders.
Do not use WhatsApp for bank account linking or financial transactions.
```

---

### 26.2 WhatsApp Monthly Reminders

The system can remind Harsh monthly:

```text
Please upload this month’s statements.
Please add wealth snapshot for June 2026.
Please review 8 unclear transactions.
Your monthly report is ready.
```

Example WhatsApp reminder:

```text
Team Chikesh Finance Coach:
June report is almost ready. Please add:
1. Harsh wealth snapshot
2. Anubhuti wealth snapshot
3. Harsh Credit Card 2 statement
```

---

### 26.3 WhatsApp Coach Questions

Future version should allow asking simple questions directly on WhatsApp:

```text
How much did Goa cost?
What is our June expense?
What is our current net worth?
Are we saving enough this month?
```

Flow:

```text
WhatsApp question
→ Backend detects intent
→ Backend fetches data
→ Backend calculates numbers
→ AI writes answer
→ WhatsApp reply sent
```

Important:

```text
The app database remains source of truth.
AI should not answer from memory.
```

---

### 26.4 Recurring Expense Memory

The app should learn recurring expenses such as:

```text
Rent
Maid
Cook
Electricity
Internet
Milk
Subscriptions
SIP/investments
Insurance
```

Future features:

```text
Detect missing recurring expense
Predict expected monthly fixed cost
Warn if a recurring bill looks unusually high
Separate fixed household baseline from lifestyle expenses
```

Example coach insight:

```text
Your normal fixed household baseline is around ₹72,000/month.
This month is higher mainly because of home setup and GOA - 2026.
```

---

### 26.5 Smarter Duplicate Detection

Improve duplicate detection between:

```text
Manual trip entries
Statement transactions
Refunds
Cash withdrawals
Split/combined payments
```

Future logic:

```text
Use AI similarity reasoning for notes/merchant names
Use date proximity
Use amount matching
Use event context
Use owner/account context
Ask user only when confidence is low
```

Example:

```text
Manual: Harsh ₹1200 Goa airport cab
Statement: OLA CABS ₹1200
AI confidence: 0.91 duplicate
Recommended action: count once, keep statement as accounting source
```

---

### 26.6 AI Financial Health Score

Add a simple monthly health score.

Inputs:

```text
Savings rate
Investment rate
Expense trend
Credit card outstanding
Emergency fund months
Net worth change
One-time vs recurring expenses
```

Output:

```text
Financial Health: Good / Needs Attention / Risky
Score: 78/100
Top reason: strong investments, but food delivery and credit card outstanding are increasing.
```

Keep this non-judgmental.

---

### 26.7 Goal Planning

Future goals page:

```text
Emergency fund
Annual travel fund
House down payment
Car fund
Parents support fund
Future child planning
Retirement
Big purchases
```

For each goal:

```text
Target amount
Current amount
Target date
Required monthly contribution
Progress chart
AI recommendation
```

Example question:

```text
Can we afford a ₹2L trip in December?
```

AI should answer using:

```text
Current savings rate
Monthly surplus
Upcoming known expenses
Goal progress
Emergency fund status
```

---

### 26.8 Better Statement Support Without Bank Integration

Future improvements can make uploads easier without direct bank integration:

```text
Better PDF parsing
Better CSV/XLSX format detection
Saved column mappings per account/card
Drag-and-drop uploads
Email-to-upload later if desired
Statement parsing templates per bank/card
```

Important:

```text
Even in future, user manually provides statements.
No direct bank linking.
No account aggregator integration.
No auto-pull from bank/card accounts.
```

---

### 26.9 Voice Note Parsing

Allow Harsh/Anubhuti to upload or send voice notes like:

```text
Harsh paid twelve hundred for Goa cab and Anu paid eight fifty for lunch.
```

AI converts to structured expenses.

This can be useful during trips when typing is inconvenient.

---

### 26.10 Periodic AI Briefings

Generate automatic summaries:

```text
Weekly spending check-in
Monthly report
Trip/event end summary
Quarterly net worth review
Yearly financial review
```

Example monthly briefing:

```text
June was a high-spend month due to GOA - 2026, but your normalized household spending is stable.
You invested ₹95,000 and net worth increased by ₹1.2L.
Next month, watch food delivery and shopping.
```

---

### 26.11 Couple-Friendly Insights

Future coach should remain relationship-safe.

It should avoid blame-based language like:

```text
Anubhuti spent too much.
Harsh paid more.
```

Use language like:

```text
Food delivery increased this month.
Travel was a planned one-time expense.
Household fixed cost is stable.
This category may need a soft cap.
```

Paid-by visibility should exist, but the tone should not make the relationship transactional.

---

## 27. Updated Future Non-Goals

Even in future, avoid:

- Bank API integration
- Account aggregator integration
- Auto-fetching bank transactions
- Auto-fetching credit card transactions
- Payment initiation
- UPI collect/payment features
- Investment trading
- Robo-advisory or regulated investment advice
- Tax filing
- Lending/borrowing products
- Public/community features

The app should stay a private AI coach and dashboard, not a fintech platform.
