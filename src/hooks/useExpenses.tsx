"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Expense, ExpenseInput } from "@/lib/types";
import { generateId, loadExpenses, saveExpenses } from "@/lib/storage";

type Status = "loading" | "ready" | "error";

interface ExpensesContextValue {
  expenses: Expense[];
  status: Status;
  error: string | null;
  addExpense: (input: ExpenseInput) => Expense;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => Expense | undefined;
  restoreExpense: (expense: Expense) => void;
  addMany: (inputs: ExpenseInput[]) => void;
  clearAll: () => void;
  retry: () => void;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

function createExpense(input: ExpenseInput): Expense {
  const now = new Date().toISOString();
  return { ...input, description: input.description.trim(), id: generateId(), createdAt: now, updatedAt: now };
}

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  // Skip persisting the value we just loaded (or received from another tab).
  const skipNextSave = useRef(true);

  const load = useCallback(() => {
    try {
      skipNextSave.current = true;
      setExpenses(loadExpenses());
      setStatus("ready");
      setError(null);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not load your expenses.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key.startsWith("expense-tracker:")) load();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);

  useEffect(() => {
    if (status !== "ready") return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    try {
      saveExpenses(expenses);
      setError(null);
    } catch {
      setError("Couldn't save to browser storage. Your latest changes may not persist.");
    }
  }, [expenses, status]);

  const addExpense = useCallback((input: ExpenseInput) => {
    const expense = createExpense(input);
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, ...input, description: input.description.trim(), updatedAt: new Date().toISOString() }
          : e,
      ),
    );
  }, []);

  const expensesRef = useRef(expenses);
  expensesRef.current = expenses;

  const deleteExpense = useCallback((id: string) => {
    const removed = expensesRef.current.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    return removed;
  }, []);

  const restoreExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => (prev.some((e) => e.id === expense.id) ? prev : [expense, ...prev]));
  }, []);

  const addMany = useCallback((inputs: ExpenseInput[]) => {
    setExpenses((prev) => [...inputs.map(createExpense), ...prev]);
  }, []);

  const clearAll = useCallback(() => setExpenses([]), []);

  const value = useMemo(
    () => ({
      expenses,
      status,
      error,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      addMany,
      clearAll,
      retry: load,
    }),
    [expenses, status, error, addExpense, updateExpense, deleteExpense, restoreExpense, addMany, clearAll, load],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses(): ExpensesContextValue {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpensesProvider");
  return ctx;
}
