"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function NoteForm({ monthKey, initialNote }: { monthKey: string; initialNote: string }) {
  const router = useRouter();
  const [note, setNote] = useState(initialNote);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Maybe I save more for the new game instead of buying snacks at school."
        className="min-h-36 w-full rounded-[24px] border-0 bg-surfaceHigh p-5 text-lg leading-relaxed"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const response = await fetch(`/api/reflect/${monthKey}/note`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ note })
            });
            setStatus(response.ok ? "Saved note" : "Could not save note");
            router.refresh();
          })
        }
        className="w-full rounded-full bg-emerald px-4 py-4 text-lg font-bold text-white shadow-lg shadow-emerald/20"
      >
        {isPending ? "Saving..." : "Save note"}
      </button>
      {status ? <p className="text-sm text-mutedInk">{status}</p> : null}
    </div>
  );
}
