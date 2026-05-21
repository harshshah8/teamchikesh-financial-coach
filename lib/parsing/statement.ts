import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  AccountType,
  ExpenseType,
  PaymentMode,
  Rule,
  TransactionDirection,
  Treatment
} from "@prisma/client";

export type ParsedStatementRow = {
  date: Date;
  description: string;
  amount: number;
  direction: TransactionDirection;
};

export type ClassifiedStatementRow = ParsedStatementRow & {
  merchant: string | null;
  category: string;
  subcategory: string | null;
  treatment: Treatment;
  expenseType: ExpenseType | null;
  paymentMode: PaymentMode | null;
  confidence: number;
  reason: string;
};

type RawRow = Record<string, unknown>;

const dateHeaders = ["date", "transaction date", "txn date", "value date", "posted date", "posting date"];
const descriptionHeaders = ["description", "narration", "particulars", "details", "merchant", "transaction details", "remarks"];
const debitHeaders = ["debit", "withdrawal", "withdrawals", "debit amount", "dr", "paid out", "amount debited"];
const creditHeaders = ["credit", "deposit", "deposits", "credit amount", "cr", "paid in", "amount credited"];
const amountHeaders = ["amount", "transaction amount", "amt"];
const directionHeaders = ["type", "dr/cr", "debit/credit", "transaction type"];

export async function parseStatementFile(file: File) {
  const fileName = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  if (fileName.endsWith(".csv")) {
    const parsed = Papa.parse<Record<string, unknown>>(buffer.toString("utf8"), {
      header: true,
      skipEmptyLines: true
    });

    if (parsed.errors.length) {
      throw new Error(parsed.errors[0]?.message ?? "Could not parse CSV file.");
    }

    return normalizeRows(parsed.data);
  }

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error("Workbook has no sheets.");

    const rows = XLSX.utils.sheet_to_json<RawRow>(workbook.Sheets[firstSheetName], {
      defval: "",
      raw: false
    });
    return normalizeRows(rows);
  }

  throw new Error("Unsupported file type. Upload CSV or XLSX.");
}

export function classifyStatementRow({
  row,
  accountType,
  rules
}: {
  row: ParsedStatementRow;
  accountType: AccountType;
  rules: Rule[];
}): ClassifiedStatementRow {
  const text = row.description.toLowerCase();
  const matchedRule = rules
    .sort((a, b) => a.priority - b.priority)
    .find((rule) => text.includes(rule.keyword.toLowerCase()));

  if (matchedRule) {
    return {
      ...row,
      merchant: matchedRule.merchant ?? cleanMerchant(row.description),
      category: matchedRule.category,
      subcategory: matchedRule.subcategory,
      treatment: matchedRule.treatment,
      expenseType: matchedRule.expenseType,
      paymentMode: paymentModeForAccount(accountType),
      confidence: 0.95,
      reason: `Matched rule: ${matchedRule.keyword}`
    };
  }

  if (/(credit card|card|cc).*(payment|pymt|bill)|autopay|billdesk/.test(text)) {
    return classified(row, accountType, "Credit Card Payment", Treatment.CREDIT_CARD_PAYMENT, ExpenseType.TRANSFER, 0.9, "Looks like a credit card bill payment.");
  }

  if (/(sip|mutual fund|zerodha|groww|kuvera|investment|nps|ppf)/.test(text)) {
    return classified(row, accountType, "Investments", Treatment.INVESTMENT, ExpenseType.INVESTMENT, 0.85, "Looks like an investment transaction.");
  }

  if (/(upi|imps|neft|rtgs|transfer|self|harsh|anubhuti)/.test(text) && row.direction === TransactionDirection.DEBIT) {
    return classified(row, accountType, "Transfer", Treatment.TRANSFER, ExpenseType.TRANSFER, 0.75, "Looks like a transfer.");
  }

  if (/(refund|reversal|cashback|chargeback)/.test(text)) {
    return classified(row, accountType, "Refund", Treatment.REFUND, null, 0.85, "Looks like a refund or reversal.");
  }

  if (/(salary|payroll)/.test(text) || row.direction === TransactionDirection.CREDIT) {
    return classified(row, accountType, "Income", Treatment.INCOME, ExpenseType.INCOME, 0.65, "Credit transaction without a stronger rule.");
  }

  if (row.direction === TransactionDirection.DEBIT) {
    return classified(row, accountType, "Other", Treatment.EXPENSE, ExpenseType.HOUSEHOLD, 0.6, "Debit transaction defaulted to expense.");
  }

  return classified(row, accountType, "Unknown", Treatment.UNKNOWN, null, 0.4, "Could not classify confidently.");
}

function classified(
  row: ParsedStatementRow,
  accountType: AccountType,
  category: string,
  treatment: Treatment,
  expenseType: ExpenseType | null,
  confidence: number,
  reason: string
): ClassifiedStatementRow {
  return {
    ...row,
    merchant: cleanMerchant(row.description),
    category,
    subcategory: null,
    treatment,
    expenseType,
    paymentMode: paymentModeForAccount(accountType),
    confidence,
    reason
  };
}

function normalizeRows(rows: RawRow[]) {
  if (!rows.length) return [];

  const headers = Object.keys(rows[0] ?? {});
  const mapping = {
    date: findHeader(headers, dateHeaders),
    description: findHeader(headers, descriptionHeaders),
    debit: findHeader(headers, debitHeaders),
    credit: findHeader(headers, creditHeaders),
    amount: findHeader(headers, amountHeaders),
    direction: findHeader(headers, directionHeaders)
  };

  if (!mapping.date || !mapping.description || (!mapping.amount && !mapping.debit && !mapping.credit)) {
    throw new Error("Could not detect statement columns. Expected date, description, and amount/debit/credit columns.");
  }

  return rows
    .map((rawRow) => normalizeRow(rawRow, mapping))
    .filter((row): row is ParsedStatementRow => Boolean(row));
}

function normalizeRow(
  rawRow: RawRow,
  mapping: {
    date?: string;
    description?: string;
    debit?: string;
    credit?: string;
    amount?: string;
    direction?: string;
  }
) {
  const date = parseDate(rawRow[mapping.date!]);
  const description = String(rawRow[mapping.description!] ?? "").trim();
  const debit = mapping.debit ? parseAmount(rawRow[mapping.debit]) : 0;
  const credit = mapping.credit ? parseAmount(rawRow[mapping.credit]) : 0;
  const amountValue = mapping.amount ? parseAmount(rawRow[mapping.amount]) : 0;
  const explicitDirection = mapping.direction ? String(rawRow[mapping.direction] ?? "").toLowerCase() : "";

  if (!date || !description) return null;

  if (debit > 0) {
    return { date, description, amount: debit, direction: TransactionDirection.DEBIT };
  }

  if (credit > 0) {
    return { date, description, amount: credit, direction: TransactionDirection.CREDIT };
  }

  if (!amountValue) return null;

  const direction =
    amountValue < 0 || explicitDirection.includes("debit") || explicitDirection === "dr"
      ? TransactionDirection.DEBIT
      : TransactionDirection.CREDIT;

  return {
    date,
    description,
    amount: Math.abs(amountValue),
    direction
  };
}

function findHeader(headers: string[], candidates: string[]) {
  return headers.find((header) => candidates.includes(normalizeHeader(header)));
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function parseAmount(value: unknown) {
  if (typeof value === "number") return Math.abs(value);
  const text = String(value ?? "").trim();
  if (!text) return 0;

  const negative = text.includes("(") || text.startsWith("-");
  const numeric = Number(text.replace(/[₹,\s()]/g, ""));
  if (Number.isNaN(numeric)) return 0;

  return negative ? -Math.abs(numeric) : numeric;
}

function parseDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  const text = String(value ?? "").trim();
  if (!text) return null;

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const slashMatch = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (slashMatch) {
    const [, day, month, rawYear] = slashMatch;
    const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(date.getTime())) return date;
  }

  return null;
}

function cleanMerchant(description: string) {
  return description
    .replace(/\s+/g, " ")
    .replace(/\b(ref|txn|upi|imps|neft|rtgs)[:/-]?\s*\w+/gi, "")
    .trim()
    .slice(0, 80);
}

function paymentModeForAccount(accountType: AccountType) {
  if (accountType === AccountType.CREDIT_CARD) return PaymentMode.CREDIT_CARD;
  if (accountType === AccountType.CASH) return PaymentMode.CASH;
  if (accountType === AccountType.BANK) return PaymentMode.BANK_TRANSFER;
  return PaymentMode.OTHER;
}
