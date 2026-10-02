"use client";

import type { Expense } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { useExpenseEditor } from "../ExpenseEditorProvider";
import { CategoryBadge, CategoryIcon } from "../CategoryBadge";
import { PencilIcon, TrashIcon } from "../Icons";

export function ExpenseList({ expenses }: { expenses: Expense[] }) {
  const { openEdit, requestDelete } = useExpenseEditor();

  return (
    <>
      {/* Desktop table */}
      <div className="card hidden overflow-hidden md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/70 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3">Date</th>
              <th scope="col" className="px-5 py-3">Description</th>
              <th scope="col" className="px-5 py-3">Category</th>
              <th scope="col" className="px-5 py-3 text-right">Amount</th>
              <th scope="col" className="w-28 px-5 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((e) => (
              <tr key={e.id} className="group transition hover:bg-slate-50/70">
                <td className="whitespace-nowrap px-5 py-3.5 text-slate-500">{formatDate(e.date)}</td>
                <td className="max-w-xs truncate px-5 py-3.5 font-medium text-slate-900" title={e.description}>
                  {e.description}
                </td>
                <td className="px-5 py-3.5">
                  <CategoryBadge category={e.category} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                  {formatCurrency(e.amountCents)}
                </td>
                <td className="px-5 py-3.5">
                  <RowActions expense={e} onEdit={openEdit} onDelete={requestDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="card divide-y divide-slate-100 md:hidden">
        {expenses.map((e) => (
          <li key={e.id} className="flex items-center gap-3 p-4">
            <CategoryIcon category={e.category} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{e.description}</p>
              <p className="text-xs text-slate-500">
                {e.category} · {formatDate(e.date)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-semibold tabular-nums text-slate-900">{formatCurrency(e.amountCents)}</p>
              <RowActions expense={e} onEdit={openEdit} onDelete={requestDelete} compact />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function RowActions({
  expense,
  onEdit,
  onDelete,
  compact = false,
}: {
  expense: Expense;
  onEdit: (e: Expense) => void;
  onDelete: (e: Expense) => void;
  compact?: boolean;
}) {
  const base = `rounded-lg text-slate-400 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
    compact ? "p-1" : "p-2"
  }`;
  return (
    <div
      className={`flex justify-end gap-1 ${
        compact ? "" : "opacity-60 transition group-hover:opacity-100 group-focus-within:opacity-100"
      }`}
    >
      <button
        type="button"
        onClick={() => onEdit(expense)}
        className={`${base} hover:bg-brand-50 hover:text-brand-600`}
        aria-label={`Edit ${expense.description}`}
        title="Edit"
      >
        <PencilIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(expense)}
        className={`${base} hover:bg-red-50 hover:text-red-600`}
        aria-label={`Delete ${expense.description}`}
        title="Delete"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ExpenseListSkeleton() {
  return (
    <div className="card divide-y divide-slate-100" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-3 w-1/4" />
          </div>
          <div className="skeleton h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
