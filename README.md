# Spendwise — Expense Tracker

A personal expense tracker built with Next.js 14 (App Router), TypeScript and Tailwind CSS. Data is stored in your browser's `localStorage`.

## Getting started

Requires Node.js 18.17+.

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build:

```bash
npm run build
npm start
```

Other scripts: `npm run lint`, `npm run typecheck`.

## Features

- **Dashboard** — total spending, month-to-date (vs. the same period last month), daily average, top category, a 6‑month spending chart with hover tooltips, a category breakdown (this month / 3 months / all time) and recent expenses.
- **Expenses** — searchable, filterable (category, date range, quick presets) and sortable list; table on desktop, cards on mobile; "Show more" pagination.
- **Add / edit** — modal form with validation (required fields, positive amount ≤ $1M with up to 2 decimals, no future dates, description ≤ 120 chars) and a native date picker.
- **Delete** — confirmation dialog, plus an **Undo** toast.
- **CSV export** — exports the currently filtered list (Excel-friendly UTF‑8, formula-injection safe).
- **Sample data** — "Load sample data" from the empty state fills ~5 months of realistic expenses.
- Loading skeletons, toast feedback, storage-error banner, multi-tab sync, keyboard- and screen-reader-friendly controls.

## Project structure

```
src/
  app/                 layout, dashboard (page.tsx), expenses/page.tsx, globals.css
  components/          UI: header, modal, form, toasts, editor provider
    dashboard/         summary cards and charts
    expenses/          filter bar and list
  hooks/useExpenses    expenses state (React context) + localStorage persistence
  lib/                 types, formatting, analytics, CSV, storage, sample data
```

Amounts are stored as integer cents and dates as local `YYYY-MM-DD` strings, which avoids floating-point and time-zone bugs.
