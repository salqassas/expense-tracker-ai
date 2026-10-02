"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { filterExpenses, sortExpenses, sumCents } from "@/lib/analytics";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, todayISO } from "@/lib/format";
import { EMPTY_FILTERS, type ExpenseFilters, type SortKey } from "@/lib/types";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/expenses/FilterBar";
import { ExpenseList, ExpenseListSkeleton } from "@/components/expenses/ExpenseList";
import { useToast } from "@/components/ToastProvider";
import { DownloadIcon, FilterIcon } from "@/components/Icons";

const PAGE_SIZE = 25;

export default function ExpensesPage() {
  const { expenses, status } = useExpenses();
  const toast = useToast();
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [visible, setVisible] = useState(PAGE_SIZE);
  // Keeps typing in the search box responsive on large lists.
  const deferredFilters = useDeferredValue(filters);

  const results = useMemo(
    () => sortExpenses(filterExpenses(expenses, deferredFilters), sort),
    [expenses, deferredFilters, sort],
  );
  const total = sumCents(results);
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  const updateFilters = (next: ExpenseFilters) => {
    setFilters(next);
    setVisible(PAGE_SIZE);
  };

  const handleExport = () => {
    if (results.length === 0) {
      toast("Nothing to export with the current filters", { variant: "error" });
      return;
    }
    try {
      downloadCsv(results, `expenses-${todayISO()}.csv`);
      toast(`Exported ${results.length} ${results.length === 1 ? "expense" : "expenses"} to CSV`);
    } catch {
      toast("Export failed. Please try again.", { variant: "error" });
    }
  };

  return (
    <>
      <PageHeader
        title="Expenses"
        subtitle={
          status === "ready" && expenses.length > 0 ? (
            <span className="tabular-nums">
              {isFiltered ? `${results.length} of ${expenses.length}` : expenses.length} expenses ·{" "}
              <span className="font-semibold text-slate-700">{formatCurrency(total)}</span>
              {isFiltered && " matching filters"}
            </span>
          ) : (
            "Search, filter, edit and export your expenses."
          )
        }
        actions={
          expenses.length > 0 && (
            <button type="button" onClick={handleExport} className="btn-secondary">
              <DownloadIcon className="h-4 w-4" />
              Export CSV
            </button>
          )
        }
      />

      {status === "loading" && <ExpenseListSkeleton />}

      {status !== "loading" && expenses.length === 0 && <EmptyState />}

      {status !== "loading" && expenses.length > 0 && (
        <div className="space-y-4">
          <FilterBar filters={filters} onChange={updateFilters} sort={sort} onSortChange={setSort} />

          {results.length === 0 ? (
            <div className="card flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <FilterIcon className="h-6 w-6" />
              </span>
              <h2 className="mt-4 font-semibold text-slate-900">No matching expenses</h2>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
              <button type="button" onClick={() => updateFilters(EMPTY_FILTERS)} className="btn-secondary mt-5">
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <ExpenseList expenses={results.slice(0, visible)} />
              {results.length > visible && (
                <div className="flex justify-center">
                  <button type="button" onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-secondary">
                    Show more ({results.length - visible} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}
