"use client";

import { useActionState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { deleteEventTransactionFeedback, updateEventTransactionFeedback } from "@/app/actions";
import { useCelebration } from "@/components/Celebration";
import { formatMoney } from "@/lib/formatting/money";

type Person = {
  id: string;
  name: string;
};

export type EventHistoryTransaction = {
  id: string;
  eventId: string;
  ownerId: string;
  ownerName: string;
  amount: number;
  date: string;
  category: string;
  paymentMode: string;
  notes: string;
  description: string;
  source: string;
};

const initialState = {
  ok: false,
  message: "",
  nonce: 0
};

export function EventTransactionHistory({
  transactions,
  users,
  categories,
  paymentModes
}: {
  transactions: EventHistoryTransaction[];
  users: Person[];
  categories: string[];
  paymentModes: string[];
}) {
  return (
    <section className="mt-5 px-4">
      <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">Transaction History</h2>
            <p className="mt-1 text-sm text-ink/55">{transactions.length} trip expenses</p>
          </div>
        </div>
        <div className="grid gap-3">
          {transactions.length ? (
            transactions.map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                users={users}
                categories={categories}
                paymentModes={paymentModes}
              />
            ))
          ) : (
            <p className="rounded-md bg-paper p-3 text-sm text-ink/60">No expenses added yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function TransactionRow({
  transaction,
  users,
  categories,
  paymentModes
}: {
  transaction: EventHistoryTransaction;
  users: Person[];
  categories: string[];
  paymentModes: string[];
}) {
  const editable = transaction.source === "MANUAL_EVENT";
  const [updateState, updateAction, updatePending] = useActionState(updateEventTransactionFeedback, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteEventTransactionFeedback, initialState);
  const { celebrate, confetti } = useCelebration();

  useEffect(() => {
    if (!updateState.message || !updateState.nonce) return;
    if (updateState.ok) celebrate("success");
  }, [celebrate, updateState]);

  useEffect(() => {
    if (!deleteState.message || !deleteState.nonce) return;
    if (deleteState.ok) celebrate("quiet");
  }, [celebrate, deleteState]);

  return (
    <details className="rounded-md border border-black/10 bg-paper p-3">
      {confetti}
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium">{transaction.notes || transaction.description || transaction.category}</p>
            <p className="mt-1 text-xs text-ink/55">
              {transaction.date} · {transaction.ownerName} · {transaction.category} · {transaction.paymentMode.replaceAll("_", " ")}
            </p>
            {transaction.source !== "MANUAL_EVENT" ? <p className="mt-1 text-xs text-ink/45">From statement upload</p> : null}
          </div>
          <p className="shrink-0 font-semibold">{formatMoney(transaction.amount)}</p>
        </div>
      </summary>

      {editable ? (
        <div className="mt-4 grid gap-3 border-t border-black/10 pt-4">
          <form action={updateAction} className="grid gap-3">
            <input type="hidden" name="eventId" value={transaction.eventId} />
            <input type="hidden" name="transactionId" value={transaction.id} />
            <select name="ownerId" className="h-11 rounded-md border border-black/15 bg-white px-3" defaultValue={transaction.ownerId} required>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <input name="amount" inputMode="decimal" defaultValue={transaction.amount} className="h-11 rounded-md border border-black/15 bg-white px-3" required />
            <div className="grid grid-cols-2 gap-3">
              <select name="category" className="h-11 rounded-md border border-black/15 bg-white px-3" defaultValue={transaction.category}>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <select name="paymentMode" className="h-11 rounded-md border border-black/15 bg-white px-3" defaultValue={transaction.paymentMode}>
                {paymentModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
            <input name="date" type="date" defaultValue={transaction.date} className="h-11 rounded-md border border-black/15 bg-white px-3" />
            <textarea name="notes" defaultValue={transaction.notes} className="min-h-20 rounded-md border border-black/15 bg-white p-3" />
            <button className="interactive-button h-11 rounded-md bg-ink font-medium text-white" disabled={updatePending}>
              {updatePending ? "Updating..." : "Update Expense"}
            </button>
            {updateState.message ? <p className={`text-xs ${updateState.ok ? "text-ink/60" : "text-clay"}`}>{updateState.message}</p> : null}
          </form>

          <form action={deleteAction}>
            <input type="hidden" name="eventId" value={transaction.eventId} />
            <input type="hidden" name="transactionId" value={transaction.id} />
            <button className="interactive-button flex h-10 items-center gap-2 rounded-md border border-clay/30 px-3 text-sm font-medium text-clay" disabled={deletePending}>
              <Trash2 size={16} />
              {deletePending ? "Deleting..." : "Delete Expense"}
            </button>
            {deleteState.message ? <p className={`mt-2 text-xs ${deleteState.ok ? "text-ink/60" : "text-clay"}`}>{deleteState.message}</p> : null}
          </form>
        </div>
      ) : (
        <p className="mt-4 border-t border-black/10 pt-3 text-sm text-ink/55">Statement-linked rows are read-only here.</p>
      )}
    </details>
  );
}
