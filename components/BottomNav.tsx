"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bot, Home, ListPlus, Map } from "lucide-react";
import clsx from "clsx";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/events", label: "Trips", icon: Map },
  { href: "/records", label: "Records", icon: ListPlus },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/coach", label: "Coach", icon: Bot }
];

export function BottomNav() {
  const pathname = usePathname();
  if (pathname === "/login") return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-paper/95 px-2 py-2 backdrop-blur">
      <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "interactive-button flex h-14 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium",
                active ? "bg-ink text-white" : "text-ink/65 hover:bg-mint hover:text-ink"
              )}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
