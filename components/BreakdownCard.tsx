import { formatMoney } from "@/lib/formatting/money";

type BreakdownItem = {
  name: string;
  value: number;
};

const colors = ["#9BC8A7", "#F2B6A0", "#9EC5E5", "#F4D38A", "#C7B2DE", "#A7DAD8", "#F0A6B7", "#B7D58B"];

export function BreakdownCard({
  title,
  data
}: {
  title: string;
  data: BreakdownItem[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="interactive-card rounded-lg border border-black/10 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm font-medium text-ink/60">{formatMoney(total)}</p>
      </div>
      {!data.length || total <= 0 ? (
        <p className="mt-4 text-sm text-ink/55">No data yet.</p>
      ) : (
        <div className="mt-4">
          <div className="space-y-3">
            {data.map((item, index) => {
              const percent = Math.round((item.value / total) * 100);
              return (
                <div key={item.name}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                      <span className="truncate">{formatLabel(item.name)}</span>
                    </div>
                    <span className="shrink-0 font-medium">{formatMoney(item.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-black/5">
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: colors[index % colors.length] }} />
                  </div>
                  <p className="mt-1 text-xs text-ink/45">{percent}%</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}
