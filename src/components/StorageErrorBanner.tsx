"use client";

import { useExpenses } from "@/hooks/useExpenses";
import { AlertIcon } from "./Icons";

export function StorageErrorBanner() {
  const { error, status, retry } = useExpenses();
  if (!error) return null;
  return (
    <div role="alert" className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5 text-sm text-amber-800 sm:px-6 lg:px-8">
        <AlertIcon className="h-5 w-5 shrink-0" />
        <p className="flex-1">{error}</p>
        {status === "error" && (
          <button type="button" onClick={retry} className="font-semibold underline-offset-2 hover:underline">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
