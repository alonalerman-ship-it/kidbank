import { store } from "@/lib/server/store";

export async function TopBar() {
  const settings = await store.getSettings();

  return (
    <header className="fixed left-0 top-0 z-50 h-20 w-full bg-emerald-50/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full w-full max-w-md items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-emerald bg-mint text-sm font-extrabold text-emerald">
            {settings.childName.slice(0, 1).toUpperCase()}
          </div>
          <span className="font-display text-2xl font-extrabold tracking-tight text-emerald">KidBank</span>
        </div>
      </div>
    </header>
  );
}
