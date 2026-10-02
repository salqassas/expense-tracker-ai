import type { Category } from "./types";

interface CategoryStyle {
  /** Series color for charts and identity dots. */
  color: string;
  icon: string;
}

// Colors are slots 1–6 of a colorblind-validated categorical palette, assigned in the
// fixed CATEGORIES order so a category keeps its color regardless of rank or filters.
export const CATEGORY_STYLES: Record<Category, CategoryStyle> = {
  Food: { color: "#2a78d6", icon: "🍽️" },
  Transportation: { color: "#eb6834", icon: "🚗" },
  Entertainment: { color: "#1baf7a", icon: "🎬" },
  Shopping: { color: "#eda100", icon: "🛍️" },
  Bills: { color: "#e87ba4", icon: "🧾" },
  Other: { color: "#008300", icon: "📦" },
};
