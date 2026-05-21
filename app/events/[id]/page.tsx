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

  return (
    <main>
      <PageHeader title={summary.event.name} subtitle={`${summary.event.type.replaceAll("_", " ")} · ${summary.event.status}`} />
      <section className="grid gap-3 px-4 sm:grid-cols-3">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft sm:col-span-2">
          <p className="text-sm text-ink/60">Total Spend</p>
          <p className="mt-2 text-3xl font-semibold">{formatMoney(summary.total)}</p>
        </div>
        <form action={endEvent} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <input type="hidden" name="eventId" value={summary.event.id} />
          <button className="h-12 w-full rounded-md bg-clay font-medium text-white">Mark Ended</button>
          {summary.event.aiSummary ? <p className="mt-3 text-sm text-ink/65">{summary.event.aiSummary}</p> : null}
        </form>
      </section>

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
            <button className="h-12 rounded-md bg-ink font-medium text-white">Save Expense</button>
          </div>
        </form>
      </section>

      <section className="mt-5 grid gap-3 px-4 sm:grid-cols-2">
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Paid By</h2>
          <SimpleBarChart data={summary.byOwner} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Category</h2>
          <SimplePieChart data={summary.byCategory} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Daily Spend</h2>
          <SimpleBarChart data={summary.byDate} />
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <h2 className="font-semibold">Payment Mode</h2>
          <SimplePieChart data={summary.byPaymentMode} />
        </div>
      </section>
    </main>
  );
}
