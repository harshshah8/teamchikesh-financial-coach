import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { SimpleBarChart, SimplePieChart } from "@/components/Charts";
import { EndTripButton } from "@/components/EndTripButton";
import { EventExpenseForm } from "@/components/EventExpenseForm";
import { EventTransactionHistory } from "@/components/EventTransactionHistory";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getEventSummary } from "@/lib/calculations/event";
import { formatMoney } from "@/lib/formatting/money";
import { toNumber } from "@/lib/formatting/money";
import { eventExpenseCategories, eventPaymentModes } from "@/lib/events/constants";

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;
  const [summary, users, historyTransactions] = await Promise.all([
    getEventSummary(id),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.transaction.findMany({
      where: {
        eventId: id,
        treatment: "EXPENSE",
        duplicateOfTransactionId: null
      },
      include: { owner: true },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }]
    })
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
          {eventIsActive ? <EndTripButton eventId={summary.event.id} /> : null}
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

      <EventTransactionHistory
        users={users}
        categories={eventExpenseCategories}
        paymentModes={eventPaymentModes}
        transactions={historyTransactions.map((transaction) => ({
          id: transaction.id,
          eventId: transaction.eventId ?? summary.event.id,
          ownerId: transaction.ownerId,
          ownerName: transaction.owner.name,
          amount: toNumber(transaction.amount),
          date: transaction.date.toISOString().slice(0, 10),
          category: transaction.category ?? "Other",
          paymentMode: transaction.paymentMode ?? "OTHER",
          notes: transaction.notes ?? "",
          description: transaction.description ?? "",
          source: transaction.source
        }))}
      />

      {eventIsActive ? (
        <EventExpenseForm
          eventId={summary.event.id}
          users={users}
          categories={eventExpenseCategories}
          paymentModes={eventPaymentModes}
        />
      ) : null}
    </main>
  );
}
