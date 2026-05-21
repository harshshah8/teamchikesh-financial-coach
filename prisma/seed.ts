import { PrismaClient, AccountType, Treatment, ExpenseType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const harsh = await prisma.user.upsert({
    where: { name: "Harsh" },
    update: {},
    create: { name: "Harsh", role: "Owner" }
  });

  const anubhuti = await prisma.user.upsert({
    where: { name: "Anubhuti" },
    update: {},
    create: { name: "Anubhuti", role: "Owner" }
  });

  const accounts = [
    [harsh.id, "Harsh Bank", AccountType.BANK],
    [harsh.id, "Harsh Credit Card 1", AccountType.CREDIT_CARD],
    [harsh.id, "Harsh Credit Card 2", AccountType.CREDIT_CARD],
    [harsh.id, "Harsh Credit Card 3", AccountType.CREDIT_CARD],
    [anubhuti.id, "Anubhuti Bank", AccountType.BANK],
    [anubhuti.id, "Anubhuti Credit Card", AccountType.CREDIT_CARD]
  ] as const;

  for (const [ownerId, name, type] of accounts) {
    const existing = await prisma.account.findFirst({ where: { ownerId, name } });
    if (!existing) {
      await prisma.account.create({ data: { ownerId, name, type } });
    }
  }

  const rules = [
    ["swiggy", "Food", Treatment.EXPENSE, ExpenseType.HOUSEHOLD],
    ["zomato", "Food", Treatment.EXPENSE, ExpenseType.HOUSEHOLD],
    ["credit card payment", "Credit Card Payment", Treatment.CREDIT_CARD_PAYMENT, ExpenseType.TRANSFER],
    ["cc payment", "Credit Card Payment", Treatment.CREDIT_CARD_PAYMENT, ExpenseType.TRANSFER],
    ["sip", "Investments", Treatment.INVESTMENT, ExpenseType.INVESTMENT],
    ["mutual fund", "Investments", Treatment.INVESTMENT, ExpenseType.INVESTMENT],
    ["salary", "Income", Treatment.INCOME, ExpenseType.INCOME]
  ] as const;

  for (const [keyword, category, treatment, expenseType] of rules) {
    const existing = await prisma.rule.findFirst({ where: { keyword } });
    if (!existing) {
      await prisma.rule.create({ data: { keyword, category, treatment, expenseType } });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
