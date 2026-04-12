import { LockKeyhole } from "lucide-react";

import { Card } from "@/components/card";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") ? params.next : "/";

  return (
    <div className="flex min-h-[70vh] items-center pb-28">
      <Card className="w-full overflow-hidden bg-surfaceLowest">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[24px] bg-mint text-emerald shadow-soft">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-mutedInk">Private app</p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">Open KidBank</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-mutedInk">
          Enter the family password to see the app.
        </p>

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <input type="hidden" name="next" value={nextPath} />
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.2em] text-mutedInk">
              Password
            </span>
            <input
              autoFocus
              required
              name="password"
              type="password"
              className="w-full rounded-[20px] border-2 border-surfaceHigh bg-surfaceLow px-4 py-4 text-lg font-bold text-ink"
              placeholder="Enter password"
            />
          </label>
          {params.error ? (
            <p className="text-sm font-bold text-coral">That password did not work. Try again.</p>
          ) : null}
          <button className="w-full rounded-full bg-ink px-6 py-4 text-lg font-black text-white shadow-card transition active:scale-[0.98]">
            Unlock app
          </button>
        </form>
      </Card>
    </div>
  );
}
