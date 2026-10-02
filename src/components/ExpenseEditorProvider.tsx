"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Expense, ExpenseInput } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { useExpenses } from "@/hooks/useExpenses";
import { Modal } from "./Modal";
import { ExpenseForm } from "./ExpenseForm";
import { useToast } from "./ToastProvider";

interface EditorState {
  open: boolean;
  expense?: Expense;
}

interface ExpenseEditorContextValue {
  openCreate: () => void;
  openEdit: (expense: Expense) => void;
  requestDelete: (expense: Expense) => void;
}

const ExpenseEditorContext = createContext<ExpenseEditorContextValue | null>(null);

/** Owns the add/edit modal and delete confirmation so any page can trigger them. */
export function ExpenseEditorProvider({ children }: { children: ReactNode }) {
  const { addExpense, updateExpense, deleteExpense, restoreExpense } = useExpenses();
  const toast = useToast();
  const [editor, setEditor] = useState<EditorState>({ open: false });
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const openCreate = useCallback(() => setEditor({ open: true }), []);
  const openEdit = useCallback((expense: Expense) => setEditor({ open: true, expense }), []);
  const requestDelete = useCallback((expense: Expense) => setPendingDelete(expense), []);
  const close = () => setEditor((s) => ({ ...s, open: false }));

  const handleSubmit = (input: ExpenseInput) => {
    if (editor.expense) {
      updateExpense(editor.expense.id, input);
      toast("Expense updated");
    } else {
      addExpense(input);
      toast(`Added ${formatCurrency(input.amountCents)} for ${input.description}`);
    }
    close();
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    const removed = deleteExpense(pendingDelete.id);
    setPendingDelete(null);
    if (removed) {
      toast("Expense deleted", {
        variant: "info",
        action: { label: "Undo", onClick: () => restoreExpense(removed) },
      });
    }
  };

  return (
    <ExpenseEditorContext.Provider value={{ openCreate, openEdit, requestDelete }}>
      {children}

      <Modal
        open={editor.open}
        onClose={close}
        title={editor.expense ? "Edit expense" : "Add expense"}
        description={editor.expense ? "Update the details below." : "Record a new expense to keep your budget on track."}
      >
        {/* Keyed so the form resets each time it opens for a different expense. */}
        <ExpenseForm
          key={editor.expense?.id ?? "new"}
          initial={editor.expense}
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </Modal>

      <Modal open={!!pendingDelete} onClose={() => setPendingDelete(null)} title="Delete expense?" size="sm">
        {pendingDelete && (
          <>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-900">{pendingDelete.description}</span> (
              {formatCurrency(pendingDelete.amountCents)}) will be removed. You can undo this right after.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" className="btn-secondary" onClick={() => setPendingDelete(null)}>
                Cancel
              </button>
              <button type="button" className="btn-danger" onClick={confirmDelete} autoFocus>
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>
    </ExpenseEditorContext.Provider>
  );
}

export function useExpenseEditor() {
  const ctx = useContext(ExpenseEditorContext);
  if (!ctx) throw new Error("useExpenseEditor must be used within an ExpenseEditorProvider");
  return ctx;
}
