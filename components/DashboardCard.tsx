import { ReactNode } from "react";

export function DashboardCard({ label, value, children }: { label: string; value: string; children?: ReactNode }) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
      {children ? <div className="mt-3 text-sm text-ink/65">{children}</div> : null}
    </section>
  );
}
