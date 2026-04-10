"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";

type ApiActionButtonProps = {
  endpoint: string;
  label: string;
  successLabel?: string;
  body?: Record<string, string>;
  className?: string;
  children?: ReactNode;
};

export function ApiActionButton({ endpoint, label, successLabel, body, className, children }: ApiActionButtonProps) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={isPending}
        className={className}
        onClick={() =>
          startTransition(async () => {
            const headers: HeadersInit = body ? { "Content-Type": "application/json" } : {};
            const response = await fetch(endpoint, {
              method: "POST",
              headers,
              body: body ? JSON.stringify(body) : undefined
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
              setMessage(data?.error ?? "Could not save");
              return;
            }
            setMessage(successLabel ?? "Saved");
            router.refresh();
          })
        }
      >
        {isPending ? "Saving..." : children ?? label}
      </button>
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
    </div>
  );
}
