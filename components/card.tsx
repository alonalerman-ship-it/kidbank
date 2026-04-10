import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-panel border border-white/60 bg-surfaceLowest/95 p-5 shadow-card", className)}>{children}</section>;
}
