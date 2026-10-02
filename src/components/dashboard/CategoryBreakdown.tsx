"use client";

import { useMemo, useState } from "react";
import type { Expense } from "@/lib/types";
import { totalsByCategory, sumCents } from "@/lib/analytics";
import { CATEGORY_STYLES } from "@/lib/categories";
import { formatCurrency, monthKey, toISODate } from "@/lib/format";

type Range = "month" | "3months" | "all";

const RANGES: Array<{ value: Range; label: string }> = [
  { value: "month", label: "This month" },
  { value: "3months", label: "3 months" },
  { value: "all", label: "All time" },
];

function inRange(expenses: Expense[], range: Range): Expense[] {
  if (range === "all") return expenses;
  const now = new Date();
  const start = toISODate(new Date(now.getFullYear(), now.getMonth() - (range === "month" ? 0 : 2), 1));
  return expenses.filter((e) => monthKey(e.date) >= monthKey(start));
}

/** Horizontal bars, sorted by spend, each directly labeled with name, amount and share. */
export function CategoryBreakdown({ expenses }: { expenses: Expense[] }) {
  const [range, setRange] = useState<Range>("3months");
  const scoped = useMemo(() => inRange(expenses, range), [expenses, range]);
  const totals = useMemo(() => totalsByCategory(scoped), [scoped]);
  const total = sumCents(scoped);
  const max = totals[0]?.totalCents ?? 0;

  return (
    <section className="card h-full p-5 sm:p-6" aria-labelledby="category-breakdown-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="category-breakdown-title" className="text-base font-semibold text-slate-900">
            Spending by category
          </h2>
          <p className="text-sm text-slate-500 tabular-nums">{formatCurrency(total)} total</p>
        </div>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              aria-pressed={range === r.value}
              className={`rounded-md px-2.5 py-1 transition ${
                range === r.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {totals.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No expenses in this period.</p>
      ) : (
        <ul className="space-y-4">
          {totals.map((t) => (
            <li
              key={t.category}
              className="group"
              title={`${t.category}: ${formatCurrency(t.totalCents)} across ${t.count} ${t.count === 1 ? "expense" : "expenses"}`}
            >
              <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATEGORY_STYLES[t.category].color }} />
                  {t.category}
                  <span className="text-xs font-normal text-slate-400">
                    {t.count} {t.count === 1 ? "item" : "items"}
                  </span>
                </span>
                <span className="tabular-nums text-slate-900">
                  <span className="font-semibold">{formatCurrency(t.totalCents)}</span>
                  <span className="ml-2 inline-block w-9 text-right text-xs text-slate-500">
                    {Math.round(t.share * 100)}%
                  </span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out group-hover:opacity-80"
                  style={{
                    width: `${Math.max((t.totalCents / max) * 100, 1.5)}%`,
                    backgroundColor: CATEGORY_STYLES[t.category].color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
