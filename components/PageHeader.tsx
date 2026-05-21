import { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="px-4 pb-4 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-ink/65">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    </header>
  );
}
