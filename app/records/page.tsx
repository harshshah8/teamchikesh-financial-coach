import { addManualRecord, addWealthRecord } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonthKey } from "@/lib/formatting/dates";
import { formatMoney } from "@/lib/formatting/money";
import { getWealthSummary } from "@/lib/calculations/wealth";

const recordTypes = ["Wealth Snapshot", "Investment Update", "Liability"];
const manualTypes = ["Manual Expense", "Income", "Transfer", "Refund"];

export default async function RecordsPage() {
  await requireAuth();
  const [users, wealth] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    getWealthSummary(currentMonthKey())
  ]);

  return (
    <main>
      <PageHeader title="Records" subtitle="Add wealth, liability, income, and manual entries." />
      <section className="grid gap-4 px-4">
        <form action={addWealthRecord} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="mb-4 font-semibold">Add Wealth Record</h2>
          <div className="grid gap-3">
            <input name="month" defaultValue={currentMonthKey()} className="h-12 rounded-md border border-black/15 px-3" />
            <select name="ownerId" className="h-12 rounded-md border border-black/15 px-3">
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select name="recordType" className="h-12 rounded-md border border-black/15 px-3">
              {recordTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input name="assetType" placeholder="Mutual Fund, Bank Balance, Credit Card Outstanding" className="h-12 rounded-md border border-black/15 px-3" required />
            <input name="platform" placeholder="Platform / Account optional" className="h-12 rounded-md border border-black/15 px-3" />
            <input name="amount" inputMode="decimal" placeholder="Amount" className="h-12 rounded-md border border-black/15 px-3" required />
            <label className="flex items-center gap-2 text-sm">
              <input name="isLiability" type="checkbox" className="h-4 w-4" />
              This is a liability
            </label>
            <textarea name="notes" placeholder="Notes" className="min-h-20 rounded-md border border-black/15 p-3" />
            <button className="interactive-button h-12 rounded-md bg-ink font-medium text-white">Save Wealth Record</button>
          </div>
        </form>

        <form action={addManualRecord} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="mb-4 font-semibold">Add Manual Record</h2>
          <div className="grid gap-3">
            <select name="ownerId" className="h-12 rounded-md border border-black/15 px-3">
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select name="recordType" className="h-12 rounded-md border border-black/15 px-3">
              {manualTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input name="category" placeholder="Category" className="h-12 rounded-md border border-black/15 px-3" />
            <input name="amount" inputMode="decimal" placeholder="Amount" className="h-12 rounded-md border border-black/15 px-3" required />
            <input name="date" type="date" className="h-12 rounded-md border border-black/15 px-3" />
            <textarea name="notes" placeholder="Notes" className="min-h-20 rounded-md border border-black/15 p-3" />
            <button className="interactive-button h-12 rounded-md bg-sage font-medium text-white">Save Manual Record</button>
          </div>
        </form>
      </section>

      <section className="mt-5 px-4">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Current Month Net Worth</h2>
          <p className="mt-2 text-3xl font-semibold">{formatMoney(wealth.netWorth)}</p>
          <p className="mt-1 text-sm text-ink/60">
            Assets {formatMoney(wealth.assets)} · Liabilities {formatMoney(wealth.liabilities)}
          </p>
        </div>
      </section>
    </main>
  );
}
