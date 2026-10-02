import type { DashboardStats } from "@/lib/analytics";
import { formatCurrency, formatMonthKey, todayISO } from "@/lib/format";
import { CATEGORY_STYLES } from "@/lib/categories";
import { CalendarIcon, TagIcon, TrendIcon, WalletIcon } from "../Icons";

export function SummaryCards({ stats }: { stats: DashboardStats }) {
  const monthLabel = formatMonthKey(todayISO().slice(0, 7), "long");
  const change = stats.monthChange;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<WalletIcon className="h-5 w-5" />}
        label="Total spending"
        value={formatCurrency(stats.totalCents)}
        footer={`${stats.count} ${stats.count === 1 ? "expense" : "expenses"} recorded`}
      />
      <StatCard
        icon={<CalendarIcon className="h-5 w-5" />}
        label={`This month · ${monthLabel}`}
        value={formatCurrency(stats.thisMonthCents)}
        footer={
          change === null ? (
            "No spending this time last month"
          ) : (
            <span className="inline-flex items-center gap-1">
              <span
                className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                  change > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {change > 0 ? "▲" : "▼"} {Math.abs(change * 100).toFixed(0)}%
              </span>
              vs. same period last month
            </span>
          )
        }
      />
      <StatCard
        icon={<TrendIcon className="h-5 w-5" />}
        label="Daily average"
        value={formatCurrency(stats.avgPerDayThisMonthCents)}
        footer={`Across ${stats.thisMonthCount} ${stats.thisMonthCount === 1 ? "expense" : "expenses"} this month`}
      />
      <StatCard
        icon={<TagIcon className="h-5 w-5" />}
        label={stats.topCategoryScope === "month" ? "Top category this month" : "Top category"}
        value={
          stats.topCategory ? (
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{CATEGORY_STYLES[stats.topCategory.category].icon}</span>
              {stats.topCategory.category}
            </span>
          ) : (
            "—"
          )
        }
        footer={
          stats.topCategory
            ? `${formatCurrency(stats.topCategory.totalCents)} · ${Math.round(stats.topCategory.share * 100)}% of spending`
            : "Add expenses to see insights"
        }
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  footer,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="card animate-slide-up p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">{icon}</span>
      </div>
      <p className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{footer}</p>
    </div>
  );
}

export function SummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card p-5">
          <div className="skeleton h-4 w-24" />
          <div className="skeleton mt-4 h-7 w-32" />
          <div className="skeleton mt-2 h-3 w-40" />
        </div>
      ))}
    </div>
  );
}
