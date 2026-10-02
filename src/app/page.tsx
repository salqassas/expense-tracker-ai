"use client";

import { useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { dashboardStats } from "@/lib/analytics";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { SummaryCards, SummaryCardsSkeleton } from "@/components/dashboard/SummaryCards";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { CategoryBreakdown } from "@/components/dashboard/CategoryBreakdown";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function DashboardPage() {
  const { expenses, status } = useExpenses();
  const stats = useMemo(() => dashboardStats(expenses), [expenses]);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={status === "ready" ? `${greeting()}! Here's an overview of your spending.` : "Loading your overview…"}
      />

      {status === "loading" && (
        <div className="space-y-6" aria-busy="true">
          <SummaryCardsSkeleton />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="card skeleton h-80 lg:col-span-3" />
            <div className="card skeleton h-80 lg:col-span-2" />
          </div>
        </div>
      )}

      {status !== "loading" && expenses.length === 0 && <EmptyState />}

      {status !== "loading" && expenses.length > 0 && (
        <div className="space-y-6">
          <SummaryCards stats={stats} />
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <MonthlyTrendChart expenses={expenses} />
            </div>
            <div className="lg:col-span-2">
              <CategoryBreakdown expenses={expenses} />
            </div>
          </div>
          <RecentExpenses expenses={expenses} />
        </div>
      )}
    </>
  );
}
