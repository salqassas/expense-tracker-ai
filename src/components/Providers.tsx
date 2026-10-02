"use client";

import type { ReactNode } from "react";
import { ExpensesProvider } from "@/hooks/useExpenses";
import { ToastProvider } from "./ToastProvider";
import { ExpenseEditorProvider } from "./ExpenseEditorProvider";
import { StorageErrorBanner } from "./StorageErrorBanner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ExpensesProvider>
        <ExpenseEditorProvider>
          <StorageErrorBanner />
          {children}
        </ExpenseEditorProvider>
      </ExpensesProvider>
    </ToastProvider>
  );
}
