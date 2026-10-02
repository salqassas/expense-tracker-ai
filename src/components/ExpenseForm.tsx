"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES, type Category, type Expense, type ExpenseInput } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/categories";
import { centsToInput, parseAmountToCents, todayISO } from "@/lib/format";

const MAX_AMOUNT_CENTS = 100_000_000; // $1,000,000
const MAX_DESCRIPTION = 120;

interface FormValues {
  date: string;
  amount: string;
  category: Category | "";
  description: string;
}

type Errors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): Errors {
  const errors: Errors = {};
  const today = todayISO();

  if (!values.date) errors.date = "Please choose a date.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) errors.date = "Enter a valid date.";
  else if (values.date > today) errors.date = "Date can't be in the future.";
  else if (values.date < "1900-01-01") errors.date = "Enter a realistic date.";

  if (!values.amount.trim()) errors.amount = "Amount is required.";
  else {
    const cents = parseAmountToCents(values.amount);
    if (cents === null) errors.amount = "Enter a valid amount (up to 2 decimals).";
    else if (cents <= 0) errors.amount = "Amount must be greater than zero.";
    else if (cents > MAX_AMOUNT_CENTS) errors.amount = "Amount must be $1,000,000 or less.";
  }

  if (!values.category) errors.category = "Pick a category.";

  const desc = values.description.trim();
  if (!desc) errors.description = "Add a short description.";
  else if (desc.length > MAX_DESCRIPTION) errors.description = `Keep it under ${MAX_DESCRIPTION} characters.`;

  return errors;
}

interface ExpenseFormProps {
  initial?: Expense;
  onSubmit: (input: ExpenseInput) => void;
  onCancel: () => void;
}

export function ExpenseForm({ initial, onSubmit, onCancel }: ExpenseFormProps) {
  const [values, setValues] = useState<FormValues>(() => ({
    date: initial?.date ?? todayISO(),
    amount: initial ? centsToInput(initial.amountCents) : "",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
  }));
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = validate(values);
  const showError = (field: keyof FormValues) => (submitted || touched[field]) && errors[field];

  const set = <K extends keyof FormValues>(field: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [field]: value }));
  const blur = (field: keyof FormValues) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      const first = (["date", "amount", "category", "description"] as const).find((f) => errors[f]);
      if (first) document.getElementById(`expense-${first}`)?.focus();
      return;
    }
    onSubmit({
      date: values.date,
      amountCents: parseAmountToCents(values.amount)!,
      category: values.category as Category,
      description: values.description.trim(),
    });
  };

  const inputClass = (field: keyof FormValues) =>
    `block w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      showError(field)
        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
        : "border-slate-200 focus:border-brand-400 focus:ring-brand-100"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Amount" htmlFor="expense-amount" error={showError("amount")}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-slate-400">
              $
            </span>
            <input
              id="expense-amount"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              autoFocus
              value={values.amount}
              onChange={(e) => set("amount", e.target.value)}
              onBlur={() => {
                blur("amount");
                const cents = parseAmountToCents(values.amount);
                if (cents !== null && cents > 0) set("amount", centsToInput(cents));
              }}
              aria-invalid={!!showError("amount")}
              aria-describedby={showError("amount") ? "expense-amount-error" : undefined}
              className={`${inputClass("amount")} pl-7 tabular-nums`}
            />
          </div>
        </Field>

        <Field label="Date" htmlFor="expense-date" error={showError("date")}>
          <input
            id="expense-date"
            type="date"
            max={todayISO()}
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            onBlur={() => blur("date")}
            aria-invalid={!!showError("date")}
            aria-describedby={showError("date") ? "expense-date-error" : undefined}
            className={inputClass("date")}
          />
        </Field>
      </div>

      <Field label="Category" htmlFor="expense-category" error={showError("category")}>
        <div id="expense-category" role="radiogroup" tabIndex={-1} className="grid grid-cols-2 gap-2 outline-none sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const selected = values.category === c;
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  set("category", c);
                  blur("category");
                }}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                  selected
                    ? "border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span aria-hidden="true">{CATEGORY_STYLES[c].icon}</span>
                {c}
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Description"
        htmlFor="expense-description"
        error={showError("description")}
        hint={`${values.description.trim().length}/${MAX_DESCRIPTION}`}
      >
        <input
          id="expense-description"
          placeholder="e.g. Weekly groceries"
          value={values.description}
          maxLength={MAX_DESCRIPTION + 20}
          onChange={(e) => set("description", e.target.value)}
          onBlur={() => blur("description")}
          aria-invalid={!!showError("description")}
          aria-describedby={showError("description") ? "expense-description-error" : undefined}
          className={inputClass("description")}
        />
      </Field>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | false;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
          {label}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 animate-fade-in text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
