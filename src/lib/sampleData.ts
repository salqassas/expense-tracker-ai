import type { Category, ExpenseInput } from "./types";
import { toISODate } from "./format";

const TEMPLATES: Array<[Category, string, number, number]> = [
  ["Food", "Groceries", 4500, 12000],
  ["Food", "Lunch with coworkers", 1200, 3200],
  ["Food", "Coffee", 400, 750],
  ["Transportation", "Gas", 3500, 6500],
  ["Transportation", "Rideshare", 1200, 3500],
  ["Entertainment", "Movie tickets", 1800, 3600],
  ["Entertainment", "Streaming subscription", 1599, 1599],
  ["Shopping", "Clothing", 3000, 12000],
  ["Shopping", "Household supplies", 1500, 4500],
  ["Bills", "Electricity", 8000, 14000],
  ["Bills", "Internet", 6999, 6999],
  ["Bills", "Phone plan", 4500, 4500],
  ["Other", "Gift", 2000, 7500],
];

/** Generates deterministic demo expenses spread across the last ~5 months. */
export function generateSampleExpenses(now = new Date()): ExpenseInput[] {
  const result: ExpenseInput[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let daysAgo = 150; daysAgo >= 0; daysAgo--) {
    const perDay = rand() < 0.55 ? 1 : rand() < 0.5 ? 0 : 2;
    for (let i = 0; i < perDay; i++) {
      const [category, description, min, max] = TEMPLATES[Math.floor(rand() * TEMPLATES.length)];
      const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
      result.push({
        date: toISODate(date),
        category,
        description,
        amountCents: Math.round(min + rand() * (max - min)),
      });
    }
  }
  return result;
}
