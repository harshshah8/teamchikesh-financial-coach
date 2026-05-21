import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DashboardCard } from "@/components/DashboardCard";
import { SimpleBarChart, SimplePieChart } from "@/components/Charts";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonthKey } from "@/lib/formatting/dates";
import { formatMoney } from "@/lib/formatting/money";
import { getMonthlySummary } from "@/lib/calculations/monthly";
import { getWealthSummary } from "@/lib/calculations/wealth";

export default async function HomePage() {
  await requireAuth();
  const month = currentMonthKey();
  const [monthly, wealth, activeEvents] = await Promise.all([
    getMonthlySummary(month),
    getWealthSummary(month),
    prisma.event.findMany({
      where: { status: "ACTIVE" },
      include: { transactions: { where: { treatment: "EXPENSE", duplicateOfTransactionId: null } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <main>
      <PageHeader title="Home" subtitle={`${month} financial snapshot`} />
      <section className="grid gap-3 px-4 sm:grid-cols-2">
        <DashboardCard label="Net Worth" value={formatMoney(wealth.netWorth)}>
          Assets {formatMoney(wealth.assets)} · Liabilities {formatMoney(wealth.liabilities)}
        </DashboardCard>
        <DashboardCard label="Monthly Income" value={formatMoney(monthly.income)} />
        <DashboardCard label="Monthly Expenses" value={formatMoney(monthly.expenses)} />
        <DashboardCard label="Monthly Investments" value={formatMoney(monthly.investments)} />
        <DashboardCard label="Savings Rate" value={`${monthly.savingsRate.toFixed(0)}%`}>
          Investment rate {monthly.investmentRate.toFixed(0)}%
        </DashboardCard>
        <DashboardCard label="Credit Card Payments Ignored" value={formatMoney(monthly.creditCardPaymentsIgnored)} />
      </section>

      <section className="mt-5 grid gap-3 px-4 sm:grid-cols-2">
        <Link href="/events" className="rounded-lg bg-ink p-4 font-medium text-white">
          Add Trip Expense
        </Link>
        <Link href="/records" className="rounded-lg bg-sage p-4 font-medium text-white">
          Add Wealth Record
        </Link>
        <Link href="/coach" className="rounded-lg bg-clay p-4 font-medium text-white">
          Ask Coach
        </Link>
        <Link href="/reports" className="rounded-lg bg-sky p-4 font-medium text-ink">
          View Report
        </Link>
      </section>

      <section className="mt-5 px-4">
        <h2 className="mb-3 text-lg font-semibold">Active Trips / Events</h2>
        <div className="grid gap-3">
          {activeEvents.length ? (
            activeEvents.map((event) => {
              const total = event.transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
              return (
                <Link key={event.id} href={`/events/${event.id}`} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{event.name}</p>
                      <p className="text-sm text-ink/60">{event.type.replaceAll("_", " ")}</p>
                    </div>
                    <p className="font-semibold">{formatMoney(total)}</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="rounded-lg border border-black/10 bg-white p-4 text-sm text-ink/60">No active event yet.</p>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-3 px-4 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Expense by Category</h2>
          <SimplePieChart data={monthly.byCategory} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Income vs Expense vs Investment</h2>
          <SimpleBarChart
            data={[
              { name: "Income", value: monthly.income },
              { name: "Expense", value: monthly.expenses },
              { name: "Invest", value: monthly.investments }
            ]}
          />
        </div>
      </section>
    </main>
  );
}
