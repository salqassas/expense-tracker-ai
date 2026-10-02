import Link from "next/link";
import type { Expense } from "@/lib/types";
import { sortExpenses } from "@/lib/analytics";
import { formatCurrency, formatDate } from "@/lib/format";
import { CategoryIcon } from "../CategoryBadge";

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  const recent = sortExpenses(expenses, "date-desc").slice(0, 6);

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="recent-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent-title" className="text-base font-semibold text-slate-900">
          Recent expenses
        </h2>
        <Link href="/expenses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          View all →
        </Link>
      </div>
      <ul className="-mx-2 divide-y divide-slate-100">
        {recent.map((e) => (
          <li key={e.id} className="flex items-center gap-3 rounded-lg px-2 py-3">
            <CategoryIcon category={e.category} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{e.description}</p>
              <p className="text-xs text-slate-500">
                {e.category} · {formatDate(e.date)}
              </p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-slate-900">{formatCurrency(e.amountCents)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
