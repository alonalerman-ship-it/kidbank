"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, HandCoins, House, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: House },
  { href: "/history", label: "History", icon: BookOpen },
  { href: "/owed", label: "Owed", icon: HandCoins },
  { href: "/reflect", label: "Reflect", icon: Sparkles }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full rounded-t-[3rem] bg-emerald-50/80 shadow-[0_-8px_32px_rgba(0,0,0,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-md justify-around px-4 pb-8 pt-3">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald/60 transition",
              active && "bg-emerald/15 px-6 text-emerald"
            )}
          >
            <Icon className="mb-1 h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      </div>
    </nav>
  );
}
