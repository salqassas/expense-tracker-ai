import type { Expense } from "./types";

function escapeCell(value: string): string {
  // Neutralize spreadsheet formula injection (cells starting with = + - @).
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    escapeCell(e.description),
    (e.amountCents / 100).toFixed(2),
  ]);
  return [header, ...rows].map((r) => r.join(",")).join("\r\n");
}

export function downloadCsv(expenses: Expense[], filename: string): void {
  // The BOM makes Excel detect UTF-8 correctly.
  const blob = new Blob(["﻿" + expensesToCsv(expenses)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
