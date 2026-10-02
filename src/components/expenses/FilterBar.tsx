"use client";

import { CATEGORIES, EMPTY_FILTERS, type ExpenseFilters, type SortKey } from "@/lib/types";
import { toISODate } from "@/lib/format";
import { SearchIcon, XIcon } from "../Icons";

interface Preset {
  label: string;
  range: () => { from: string; to: string };
}

const PRESETS: Preset[] = [
  {
    label: "This month",
    range: () => {
      const n = new Date();
      return { from: toISODate(new Date(n.getFullYear(), n.getMonth(), 1)), to: toISODate(n) };
    },
  },
  {
    label: "Last month",
    range: () => {
      const n = new Date();
      return {
        from: toISODate(new Date(n.getFullYear(), n.getMonth() - 1, 1)),
        to: toISODate(new Date(n.getFullYear(), n.getMonth(), 0)),
      };
    },
  },
  {
    label: "Last 30 days",
    range: () => {
      const n = new Date();
      return { from: toISODate(new Date(n.getFullYear(), n.getMonth(), n.getDate() - 29)), to: toISODate(n) };
    },
  },
  {
    label: "This year",
    range: () => {
      const n = new Date();
      return { from: toISODate(new Date(n.getFullYear(), 0, 1)), to: toISODate(n) };
    },
  },
];

interface FilterBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export function FilterBar({ filters, onChange, sort, onSortChange }: FilterBarProps) {
  const set = <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) =>
    onChange({ ...filters, [key]: value });
  const hasFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  const dateError = filters.from && filters.to && filters.from > filters.to;

  return (
    <div className="card space-y-4 p-4 sm:p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
        <div className="relative sm:col-span-2 lg:col-span-4">
          <label htmlFor="filter-search" className="sr-only">
            Search expenses
          </label>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="filter-search"
            type="search"
            placeholder="Search descriptions…"
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="input pl-9"
          />
        </div>

        <LabeledControl label="Category" htmlFor="filter-category" className="lg:col-span-2">
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => set("category", e.target.value as ExpenseFilters["category"])}
            className="input"
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </LabeledControl>

        <LabeledControl label="Sort" htmlFor="filter-sort" className="lg:col-span-2">
          <select id="filter-sort" value={sort} onChange={(e) => onSortChange(e.target.value as SortKey)} className="input">
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
        </LabeledControl>

        <LabeledControl label="From" htmlFor="filter-from" className="lg:col-span-2">
          <input
            id="filter-from"
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(e) => set("from", e.target.value)}
            className="input"
          />
        </LabeledControl>

        <LabeledControl label="To" htmlFor="filter-to" className="lg:col-span-2">
          <input
            id="filter-to"
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(e) => set("to", e.target.value)}
            className="input"
          />
        </LabeledControl>
      </div>

      {dateError && <p className="text-xs font-medium text-red-600">“From” date is after “To” date — no results will match.</p>}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Quick range:</span>
        {PRESETS.map((p) => {
          const r = p.range();
          const active = filters.from === r.from && filters.to === r.to;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onChange({ ...filters, ...r })}
              aria-pressed={active}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                active
                  ? "border-brand-200 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {p.label}
            </button>
          );
        })}
        {hasFilters && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <XIcon className="h-3.5 w-3.5" />
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

function LabeledControl({
  label,
  htmlFor,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={htmlFor} className="absolute -top-2 left-2.5 z-10 bg-white px-1 text-[11px] font-medium text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}
