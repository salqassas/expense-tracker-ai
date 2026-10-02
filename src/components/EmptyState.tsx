"use client";

import { generateSampleExpenses } from "@/lib/sampleData";
import { useExpenses } from "@/hooks/useExpenses";
import { useExpenseEditor } from "./ExpenseEditorProvider";
import { useToast } from "./ToastProvider";
import { PlusIcon, SparklesIcon, WalletIcon } from "./Icons";

/** Shown when the user has no expenses at all. */
export function EmptyState() {
  const { openCreate } = useExpenseEditor();
  const { addMany } = useExpenses();
  const toast = useToast();

  const loadSample = () => {
    const sample = generateSampleExpenses();
    addMany(sample);
    toast(`Loaded ${sample.length} sample expenses`);
  };

  return (
    <div className="card flex animate-slide-up flex-col items-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <WalletIcon className="h-7 w-7" />
      </span>
      <h2 className="mt-5 text-lg font-semibold text-slate-900">No expenses yet</h2>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        Start tracking where your money goes. Add your first expense, or load sample data to explore the dashboard.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={openCreate} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          Add your first expense
        </button>
        <button type="button" onClick={loadSample} className="btn-secondary">
          <SparklesIcon className="h-4 w-4" />
          Load sample data
        </button>
      </div>
    </div>
  );
}
