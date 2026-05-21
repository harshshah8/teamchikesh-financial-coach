import Link from "next/link";
import { EventType } from "@prisma/client";
import { CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { createEvent } from "@/app/actions";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/formatting/money";

export default async function EventsPage() {
  await requireAuth();
  const events = await prisma.event.findMany({
    include: { transactions: { where: { treatment: "EXPENSE", duplicateOfTransactionId: null } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }]
  });

  return (
    <main>
      <PageHeader title="Trips" subtitle="Create events and dump expenses quickly." />
      <section className="px-4">
        <form action={createEvent} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <CalendarPlus size={20} />
            <h2 className="font-semibold">Create Event</h2>
          </div>
          <div className="grid gap-3">
            <input name="name" placeholder="GOA - 2026" className="h-12 rounded-md border border-black/15 px-3" required />
            <div className="grid grid-cols-2 gap-3">
              <select name="type" className="h-12 rounded-md border border-black/15 px-3" defaultValue={EventType.TRIP}>
                {Object.values(EventType).map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <input name="startDate" type="date" className="h-12 rounded-md border border-black/15 px-3" />
            </div>
            <input name="budget" inputMode="numeric" placeholder="Budget optional" className="h-12 rounded-md border border-black/15 px-3" />
            <button className="interactive-button h-12 rounded-md bg-ink font-medium text-white">Create Event</button>
          </div>
        </form>
      </section>

      <section className="mt-5 grid gap-3 px-4">
        {events.map((event) => {
          const total = event.transactions.reduce((sum, txn) => sum + Number(txn.amount), 0);
          return (
            <Link key={event.id} href={`/events/${event.id}`} className="interactive-card rounded-lg border border-black/10 bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{event.name}</p>
                  <p className="text-sm text-ink/60">
                    {event.type.replaceAll("_", " ")} · {event.status}
                  </p>
                </div>
                <p className="font-semibold">{formatMoney(total)}</p>
              </div>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
