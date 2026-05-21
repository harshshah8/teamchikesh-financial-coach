-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('BANK', 'CREDIT_CARD', 'INVESTMENT', 'CASH', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('TRIP', 'HOUSE_SETUP', 'FAMILY_FUNCTION', 'MEDICAL', 'WEDDING', 'OTHER');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'ENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TransactionDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "Treatment" AS ENUM ('EXPENSE', 'INCOME', 'INVESTMENT', 'TRANSFER', 'CREDIT_CARD_PAYMENT', 'REFUND', 'LIABILITY', 'WEALTH_SNAPSHOT', 'DUPLICATE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('HOUSEHOLD', 'PERSONAL_HARSH', 'PERSONAL_ANUBHUTI', 'TRAVEL', 'FAMILY', 'HEALTH', 'INVESTMENT', 'INCOME', 'TRANSFER');

-- CreateEnum
CREATE TYPE "PaymentMode" AS ENUM ('CASH', 'UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('STATEMENT', 'MANUAL_EVENT', 'MANUAL_RECORD', 'AI_GENERATED');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('UPLOADED', 'PARSED', 'NEEDS_REVIEW', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "institution" TEXT,
    "purpose" TEXT,
    "statementDay" INTEGER,
    "dueDay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(65,30),
    "status" "EventStatus" NOT NULL DEFAULT 'ACTIVE',
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ownerId" TEXT NOT NULL,
    "accountId" TEXT,
    "eventId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "direction" "TransactionDirection" NOT NULL,
    "description" TEXT,
    "merchant" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "treatment" "Treatment" NOT NULL,
    "expenseType" "ExpenseType",
    "paymentMode" "PaymentMode",
    "source" "TransactionSource" NOT NULL,
    "sourceFileId" TEXT,
    "confidence" DOUBLE PRECISION,
    "duplicateOfTransactionId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WealthRecord" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "platform" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "isLiability" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WealthRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatementUpload" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'UPLOADED',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "StatementUpload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rule" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "merchant" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "treatment" "Treatment" NOT NULL,
    "expenseType" "ExpenseType",
    "priority" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- CreateIndex
CREATE INDEX "Transaction_eventId_idx" ON "Transaction"("eventId");

-- CreateIndex
CREATE INDEX "Transaction_ownerId_idx" ON "Transaction"("ownerId");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_treatment_idx" ON "Transaction"("treatment");

-- CreateIndex
CREATE INDEX "WealthRecord_month_idx" ON "WealthRecord"("month");

-- CreateIndex
CREATE INDEX "WealthRecord_ownerId_idx" ON "WealthRecord"("ownerId");

-- CreateIndex
CREATE INDEX "StatementUpload_ownerId_idx" ON "StatementUpload"("ownerId");

-- CreateIndex
CREATE INDEX "StatementUpload_accountId_idx" ON "StatementUpload"("accountId");

-- CreateIndex
CREATE INDEX "StatementUpload_month_idx" ON "StatementUpload"("month");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "StatementUpload"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WealthRecord" ADD CONSTRAINT "WealthRecord_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementUpload" ADD CONSTRAINT "StatementUpload_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatementUpload" ADD CONSTRAINT "StatementUpload_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
