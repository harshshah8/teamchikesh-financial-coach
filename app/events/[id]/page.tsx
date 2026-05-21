import { notFound } from "next/navigation";
import { PaymentMode } from "@prisma/client";
import { addEventExpense, endEvent } from "@/app/actions";
import { PageHeader } from "@/components/PageHeader";
import { SimpleBarChart, SimplePieChart } from "@/components/Charts";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEventSummary } from "@/lib/calculations/event";
import { formatMoney } from "@/lib/formatting/money";

const categories = ["Food", "Travel", "Stay", "Shopping", "Activity", "Cash", "Other"];

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const [summary, users] = await Promise.all([
    getEventSummary(id),
    prisma.user.findMany({ orderBy: { name: "asc" } })
  ]);

  if (!summary) notFound();
  const topCategory = summary.byCategory[0];
  const eventIsActive = summary.event.status === "ACTIVE";
  const currentSummaryText = `${summary.event.name} has total tracked spend of ${formatMoney(summary.total)} across ${summary.transactionCount} expense entries.`;

  return (
    <main>
      <PageHeader title={summary.event.name} subtitle={`${summary.event.type.replaceAll("_", " ")} · ${summary.event.status}`} />
      <section className="grid gap-3 px-4 sm:grid-cols-4">
        <div className="interactive-card rounded-lg border border-black/10 bg-white p-4 shadow-soft sm:col-span-2">
          <p className="text-sm text-ink/60">Total Spend</p>
          <p className="mt-2 text-3xl font-semibold">{formatMoney(summary.total)}</p>
          <p className="mt-2 text-sm text-ink/55">{summary.transactionCount} expense entries counted</p>
        </div>
        <div className="interactive-card rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <p className="text-sm text-ink/60">Top Category</p>
          <p className="mt-2 text-xl font-semibold">{topCategory ? topCategory.name : "None"}</p>
          <p className="mt-2 text-sm text-ink/55">{topCategory ? formatMoney(topCategory.value) : "No expense yet"}</p>
        </div>
        <div className="interactive-card rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <p className="text-sm text-ink/60">Status</p>
          <p className="mt-2 text-xl font-semibold">{summary.event.status}</p>
          {eventIsActive ? (
            <form action={endEvent} className="mt-3">
              <input type="hidden" name="eventId" value={summary.event.id} />
              <button className="interactive-button h-11 w-full rounded-md bg-clay font-medium text-white">Mark Ended</button>
            </form>
          ) : null}
        </div>
      </section>

      <section className="mt-5 px-4">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Event Report</h2>
              <p className="mt-1 text-sm leading-6 text-ink/65">{currentSummaryText}</p>
            </div>
            <span className="rounded-md bg-mint px-2 py-1 text-xs font-medium text-ink">{summary.event.status}</span>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-3 px-4 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Category</h2>
            <span className="text-sm font-medium text-ink/55">{formatMoney(summary.total)}</span>
          </div>
          <SimplePieChart data={summary.byCategory} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Paid By</h2>
            <span className="text-sm font-medium text-ink/55">{formatMoney(summary.total)}</span>
          </div>
          <SimpleBarChart data={summary.byOwner} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Daily Spend</h2>
            <span className="text-sm font-medium text-ink/55">{formatMoney(summary.total)}</span>
          </div>
          <SimpleBarChart data={summary.byDate} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Payment Mode</h2>
            <span className="text-sm font-medium text-ink/55">{formatMoney(summary.total)}</span>
          </div>
          <SimplePieChart data={summary.byPaymentMode} />
        </div>
      </section>

      {eventIsActive ? (
        <section className="mt-5 px-4">
          <form action={addEventExpense} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
            <h2 className="mb-4 font-semibold">Add Expense</h2>
            <input type="hidden" name="eventId" value={summary.event.id} />
            <div className="grid gap-3">
              <select name="ownerId" className="h-12 rounded-md border border-black/15 px-3" required>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <input name="amount" inputMode="decimal" placeholder="Amount" className="h-12 rounded-md border border-black/15 px-3" required />
              <div className="grid grid-cols-2 gap-3">
                <select name="category" className="h-12 rounded-md border border-black/15 px-3" defaultValue="Food">
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <select name="paymentMode" className="h-12 rounded-md border border-black/15 px-3" defaultValue={PaymentMode.UPI}>
                  {Object.values(PaymentMode).map((mode) => (
                    <option key={mode} value={mode}>
                      {mode.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <input name="date" type="date" className="h-12 rounded-md border border-black/15 px-3" />
              <textarea name="notes" placeholder="Notes" className="min-h-24 rounded-md border border-black/15 p-3" />
              <button className="interactive-button h-12 rounded-md bg-ink font-medium text-white">Save Expense</button>
            </div>
          </form>
        </section>
      ) : null}
    </main>
  );
}
