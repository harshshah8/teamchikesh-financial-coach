import { PageHeader } from "@/components/PageHeader";
import { DashboardCard } from "@/components/DashboardCard";
import { SimpleBarChart, SimplePieChart } from "@/components/Charts";
import { MonthlyAiSummary } from "@/components/MonthlyAiSummary";
import { requireAuth } from "@/lib/auth";
import { currentMonthKey } from "@/lib/formatting/dates";
import { formatMoney } from "@/lib/formatting/money";
import { getMonthlySummary } from "@/lib/calculations/monthly";
import { getWealthSummary } from "@/lib/calculations/wealth";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  await requireAuth();
  const params = await searchParams;
  const month = params.month ?? currentMonthKey();
  const [monthly, wealth] = await Promise.all([getMonthlySummary(month), getWealthSummary(month)]);

  return (
    <main>
      <PageHeader title="Reports" subtitle="Monthly totals, rates, and category breakdowns." />
      <section className="px-4">
        <form className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <label className="text-sm font-medium" htmlFor="month">
            Month
          </label>
          <div className="mt-2 flex gap-2">
            <input id="month" name="month" defaultValue={month} className="h-12 min-w-0 flex-1 rounded-md border border-black/15 px-3" />
            <button className="interactive-button rounded-md bg-ink px-4 font-medium text-white">View</button>
          </div>
        </form>
      </section>

      <section className="mt-5 grid gap-3 px-4 sm:grid-cols-2">
        <DashboardCard label="Income" value={formatMoney(monthly.income)} />
        <DashboardCard label="Expenses" value={formatMoney(monthly.expenses)} />
        <DashboardCard label="Investments" value={formatMoney(monthly.investments)} />
        <DashboardCard label="Savings Rate" value={`${monthly.savingsRate.toFixed(0)}%`} />
        <DashboardCard label="Net Worth" value={formatMoney(wealth.netWorth)} />
        <DashboardCard label="Credit Card Payments Ignored" value={formatMoney(monthly.creditCardPaymentsIgnored)} />
      </section>

      <section className="mt-5 grid gap-3 px-4 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Top Categories</h2>
          <SimplePieChart data={monthly.byCategory} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Monthly Mix</h2>
          <SimpleBarChart
            data={[
              { name: "Income", value: monthly.income },
              { name: "Expense", value: monthly.expenses },
              { name: "Invest", value: monthly.investments }
            ]}
          />
        </div>
      </section>
      <MonthlyAiSummary month={month} />
    </main>
  );
}
