import { Upload } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadStatement } from "@/app/actions";
import { currentMonthKey } from "@/lib/formatting/dates";
import { formatMoney, toNumber } from "@/lib/formatting/money";

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ uploadId?: string }> }) {
  await requireAuth();
  const params = await searchParams;
  const [users, accounts, uploads] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.account.findMany({ include: { owner: true }, orderBy: [{ owner: { name: "asc" } }, { name: "asc" }] }),
    prisma.statementUpload.findMany({
      include: {
        account: { include: { owner: true } },
        transactions: {
          include: { owner: true, event: true },
          orderBy: { date: "desc" }
        }
      },
      orderBy: { uploadedAt: "desc" },
      take: 10
    })
  ]);
  const selectedUpload = uploads.find((upload) => upload.id === params.uploadId) ?? uploads[0];

  return (
    <main>
      <PageHeader title="Upload" subtitle="CSV/XLSX statements with deterministic classification." />
      <section className="px-4">
        <form action={uploadStatement} className="rounded-lg border border-black/10 bg-white p-5 shadow-soft">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-mint">
            <Upload size={22} />
          </div>
          <h2 className="text-lg font-semibold">CSV/XLSX Upload</h2>
          <div className="mt-4 grid gap-3">
            <input name="month" defaultValue={currentMonthKey()} className="h-12 rounded-md border border-black/15 px-3" />
            <select name="ownerId" className="h-12 rounded-md border border-black/15 px-3" required>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            <select name="accountId" className="h-12 rounded-md border border-black/15 px-3" required>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.owner.name} · {account.name}
                </option>
              ))}
            </select>
            <input name="file" type="file" accept=".csv,.xlsx,.xls" className="rounded-md border border-black/15 bg-white p-3 text-sm" required />
            <button className="interactive-button h-12 rounded-md bg-ink font-medium text-white">Upload Statement</button>
          </div>
        </form>
      </section>

      <section className="mt-5 px-4">
        <h2 className="mb-3 text-lg font-semibold">Recent Uploads</h2>
        <div className="grid gap-3">
          {uploads.length ? (
            uploads.map((upload) => (
              <a
                key={upload.id}
                href={`/upload?uploadId=${upload.id}`}
                className="interactive-card rounded-lg border border-black/10 bg-white p-4 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{upload.fileName}</p>
                    <p className="mt-1 text-sm text-ink/60">
                      {upload.account.owner.name} · {upload.account.name} · {upload.month}
                    </p>
                  </div>
                  <span className="rounded-md bg-mint px-2 py-1 text-xs font-medium text-ink">{upload.status.replaceAll("_", " ")}</span>
                </div>
                <p className="mt-2 text-sm text-ink/55">{upload.transactions.length} transactions parsed</p>
              </a>
            ))
          ) : (
            <p className="rounded-lg border border-black/10 bg-white p-4 text-sm text-ink/60">No uploads yet.</p>
          )}
        </div>
      </section>

      {selectedUpload ? (
        <section className="mt-5 px-4">
          <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">Upload Result</h2>
                <p className="mt-1 text-sm text-ink/60">{selectedUpload.fileName}</p>
              </div>
              <span className="rounded-md bg-sky px-2 py-1 text-xs font-medium text-ink">{selectedUpload.status.replaceAll("_", " ")}</span>
            </div>
            <UploadMetrics transactions={selectedUpload.transactions} />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-black/10 text-xs uppercase text-ink/50">
                  <tr>
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Description</th>
                    <th className="py-2 pr-3 font-medium">Treatment</th>
                    <th className="py-2 pr-3 font-medium">Category</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUpload.transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-black/5">
                      <td className="py-3 pr-3 text-ink/60">{transaction.date.toISOString().slice(0, 10)}</td>
                      <td className="py-3 pr-3">
                        <p className="font-medium">{transaction.merchant || transaction.description}</p>
                        {transaction.event ? <p className="mt-1 text-xs text-ink/45">Linked to {transaction.event.name}</p> : null}
                      </td>
                      <td className="py-3 pr-3">{transaction.treatment.replaceAll("_", " ")}</td>
                      <td className="py-3 pr-3">{transaction.category ?? "Unknown"}</td>
                      <td className="py-3 text-right font-medium">{formatMoney(toNumber(transaction.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function UploadMetrics({
  transactions
}: {
  transactions: {
    amount: unknown;
    treatment: string;
    duplicateOfTransactionId: string | null;
    confidence: number | null;
  }[];
}) {
  const expenses = transactions.filter((transaction) => transaction.treatment === "EXPENSE" && !transaction.duplicateOfTransactionId);
  const ignored = transactions.filter((transaction) => ["CREDIT_CARD_PAYMENT", "TRANSFER", "DUPLICATE"].includes(transaction.treatment));
  const unknown = transactions.filter((transaction) => transaction.treatment === "UNKNOWN" || Number(transaction.confidence ?? 1) < 0.7);
  const totalExpense = expenses.reduce((sum, transaction) => sum + toNumber(transaction.amount), 0);

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-4">
      <div className="rounded-md bg-paper p-3">
        <p className="text-xs text-ink/50">Rows</p>
        <p className="mt-1 font-semibold">{transactions.length}</p>
      </div>
      <div className="rounded-md bg-paper p-3">
        <p className="text-xs text-ink/50">Expenses</p>
        <p className="mt-1 font-semibold">{formatMoney(totalExpense)}</p>
      </div>
      <div className="rounded-md bg-paper p-3">
        <p className="text-xs text-ink/50">Ignored</p>
        <p className="mt-1 font-semibold">{ignored.length}</p>
      </div>
      <div className="rounded-md bg-paper p-3">
        <p className="text-xs text-ink/50">Review</p>
        <p className="mt-1 font-semibold">{unknown.length}</p>
      </div>
    </div>
  );
}
