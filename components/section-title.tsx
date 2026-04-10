import type { ReactNode } from "react";

export function SectionTitle({
  eyebrow,
  title,
  action
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        {eyebrow ? <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald/80">{eyebrow}</p> : null}
        <h2 className="font-display text-[2rem] font-extrabold tracking-tight text-ink">{title}</h2>
      </div>
      {action}
    </div>
  );
}
