"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h2 className="text-2xl font-bold">Something went wrong</h2>
      <p className="max-w-sm text-sm text-[#595c5e]">{error.message || "An unexpected error occurred."}</p>
      {error.digest && (
        <p className="text-xs text-[#abadaf]">Error ID: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="rounded-full bg-[#2c2f31] px-6 py-3 text-sm font-bold text-white"
      >
        Try again
      </button>
    </div>
  );
}
