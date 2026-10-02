import { CATEGORIES, type Category, type Expense, type ExpenseFilters, type SortKey } from "./types";
import { monthKey, toISODate } from "./format";

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const q = filters.search.trim().toLowerCase();
  return expenses.filter((e) => {
    if (filters.category !== "All" && e.category !== filters.category) return false;
    if (filters.from && e.date < filters.from) return false;
    if (filters.to && e.date > filters.to) return false;
    if (q && !e.description.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}

export function sortExpenses(expenses: Expense[], sort: SortKey): Expense[] {
  return [...expenses].sort((a, b) => {
    switch (sort) {
      case "date-asc":
        return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      case "amount-desc":
        return b.amountCents - a.amountCents;
      case "amount-asc":
        return a.amountCents - b.amountCents;
      case "date-desc":
      default:
        return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    }
  });
}

export function sumCents(expenses: Expense[]): number {
  return expenses.reduce((acc, e) => acc + e.amountCents, 0);
}

export interface CategoryTotal {
  category: Category;
  totalCents: number;
  count: number;
  share: number;
}

export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const total = sumCents(expenses);
  return CATEGORIES.map((category) => {
    const items = expenses.filter((e) => e.category === category);
    const totalCents = sumCents(items);
    return { category, totalCents, count: items.length, share: total > 0 ? totalCents / total : 0 };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.totalCents - a.totalCents);
}

export interface MonthTotal {
  key: string;
  totalCents: number;
}

/** Totals for the last `months` calendar months ending at `now`, including empty months. */
export function monthlyTotals(expenses: Expense[], months: number, now = new Date()): MonthTotal[] {
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    keys.push(monthKey(toISODate(new Date(now.getFullYear(), now.getMonth() - i, 1))));
  }
  const byMonth = new Map<string, number>(keys.map((k) => [k, 0]));
  for (const e of expenses) {
    const k = monthKey(e.date);
    const current = byMonth.get(k);
    if (current !== undefined) byMonth.set(k, current + e.amountCents);
  }
  return keys.map((key) => ({ key, totalCents: byMonth.get(key) ?? 0 }));
}

export interface DashboardStats {
  totalCents: number;
  count: number;
  thisMonthCents: number;
  thisMonthCount: number;
  /** Last month's spending over the same days elapsed so far this month. */
  lastMonthCents: number;
  /** Fractional month-to-date change; null when last month had no spending in that window. */
  monthChange: number | null;
  avgPerDayThisMonthCents: number;
  /** Top category this month, falling back to all-time if nothing was spent this month. */
  topCategory: CategoryTotal | null;
  topCategoryScope: "month" | "all";
  largestExpense: Expense | null;
}

export function dashboardStats(expenses: Expense[], now = new Date()): DashboardStats {
  const thisKey = monthKey(toISODate(now));
  const lastKey = monthKey(toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)));
  const thisMonth = expenses.filter((e) => monthKey(e.date) === thisKey);
  const thisMonthCents = sumCents(thisMonth);
  // Compare month-to-date against the same days of last month, so early-month numbers aren't misleading.
  const lastMonthCents = sumCents(
    expenses.filter((e) => monthKey(e.date) === lastKey && Number(e.date.slice(8, 10)) <= now.getDate()),
  );
  const topCategoryScope = thisMonth.length ? "month" : "all";
  const categories = totalsByCategory(thisMonth.length ? thisMonth : expenses);
  const largestExpense = expenses.reduce<Expense | null>(
    (max, e) => (!max || e.amountCents > max.amountCents ? e : max),
    null,
  );

  return {
    totalCents: sumCents(expenses),
    count: expenses.length,
    thisMonthCents,
    thisMonthCount: thisMonth.length,
    lastMonthCents,
    monthChange: lastMonthCents > 0 ? (thisMonthCents - lastMonthCents) / lastMonthCents : null,
    avgPerDayThisMonthCents: Math.round(thisMonthCents / now.getDate()),
    topCategory: categories[0] ?? null,
    topCategoryScope,
    largestExpense,
  };
}
