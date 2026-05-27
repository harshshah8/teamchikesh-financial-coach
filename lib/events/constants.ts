import { PaymentMode } from "@prisma/client";

export const eventExpenseCategories = ["Food", "Travel", "Stay", "Shopping", "Activity", "Cash", "Other"];

export const eventPaymentModes = [
  PaymentMode.CASH,
  PaymentMode.UPI,
  PaymentMode.CREDIT_CARD,
  PaymentMode.DEBIT_CARD,
  PaymentMode.OTHER
];
