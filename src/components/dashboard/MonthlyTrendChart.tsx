"use client";

import { useMemo, useState } from "react";
import type { Expense } from "@/lib/types";
import { monthlyTotals } from "@/lib/analytics";
import { formatCompactCurrency, formatCurrency, formatMonthKey } from "@/lib/format";

const MONTHS = 6;
const BAR_COLOR = "#2a78d6";

/** Rounds up to a "nice" axis maximum (1, 2, 2.5, 5 × 10^n). */
function niceMax(value: number): number {
  if (value <= 0) return 100_00;
  const exp = Math.pow(10, Math.floor(Math.log10(value)));
  const f = value / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

export function MonthlyTrendChart({ expenses }: { expenses: Expense[] }) {
  const data = useMemo(() => monthlyTotals(expenses, MONTHS), [expenses]);
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.totalCents)));
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  // Average over completed months only; the current month is partial.
  const nonZero = data.slice(0, -1).filter((d) => d.totalCents > 0);
  const average = nonZero.length ? nonZero.reduce((a, d) => a + d.totalCents, 0) / nonZero.length : 0;
  const shown = active ?? data.length - 1;

  return (
    <section className="card h-full p-5 sm:p-6" aria-labelledby="monthly-trend-title">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="monthly-trend-title" className="text-base font-semibold text-slate-900">
            Monthly spending
          </h2>
          <p className="text-sm text-slate-500">Last {MONTHS} months</p>
        </div>
        <div className="text-right" aria-live="polite">
          <p className="text-xs font-medium text-slate-500">{formatMonthKey(data[shown].key, "long")}</p>
          <p className="text-lg font-bold tabular-nums text-slate-900">{formatCurrency(data[shown].totalCents)}</p>
        </div>
      </div>

      <div className="flex h-56 gap-2" aria-hidden="true">
        {/* Y axis labels */}
        <div className="flex w-10 shrink-0 flex-col justify-between pb-6 text-right text-[11px] tabular-nums text-slate-400">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
              {formatCompactCurrency(max * t)}
            </span>
          ))}
        </div>

        <div className="relative flex-1">
          {/* Gridlines */}
          <div className="absolute inset-x-0 bottom-6 top-0 flex flex-col justify-between">
            {ticks.map((t) => (
              <div key={t} className={`border-t ${t === 0 ? "border-slate-300" : "border-dashed border-slate-100"}`} />
            ))}
          </div>

          {/* Average reference line */}
          {average > 0 && (
            <div className="pointer-events-none absolute inset-x-0 bottom-6 top-0 z-10">
              <div
                className="absolute inset-x-0 border-t border-dashed border-slate-400"
                style={{ bottom: `${(average / max) * 100}%` }}
              />
            </div>
          )}

          {/* Bars */}
          <div className="absolute inset-0 flex items-stretch gap-[2px]">
            {data.map((d, i) => {
              const pct = (d.totalCents / max) * 100;
              const isActive = shown === i;
              return (
                <div
                  key={d.key}
                  className="group relative flex flex-1 cursor-default flex-col"
                  onMouseEnter={() => setActive(i)}
                  onMouseLeave={() => setActive(null)}
                  onTouchStart={() => setActive(i)}
                >
                  <div className="relative flex flex-1 items-end justify-center px-[12%]">
                    <div
                      className="w-full max-w-12 rounded-t transition-all duration-500 ease-out"
                      style={{
                        height: `${pct}%`,
                        minHeight: d.totalCents > 0 ? 2 : 0,
                        backgroundColor: BAR_COLOR,
                        opacity: isActive ? 1 : 0.55,
                      }}
                    />
                    {active === i && (
                      <div
                        className="absolute z-20 -translate-y-2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg"
                        style={{ bottom: `${pct}%` }}
                      >
                        <span className="block text-slate-300">{formatMonthKey(d.key, "long")}</span>
                        <span className="font-semibold tabular-nums">{formatCurrency(d.totalCents)}</span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex h-6 items-end justify-center text-xs ${
                      isActive ? "font-semibold text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {formatMonthKey(d.key)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {average > 0 && (
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-4 border-t border-dashed border-slate-400" />
          Average of completed months {formatCurrency(Math.round(average))}
        </p>
      )}

      {/* Screen-reader table view of the same data. */}
      <table className="sr-only">
        <caption>Monthly spending, last {MONTHS} months</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{formatMonthKey(d.key, "long")}</td>
              <td>{formatCurrency(d.totalCents)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
