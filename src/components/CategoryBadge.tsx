import type { Category } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/categories";

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_STYLES[category].color }} />
      {category}
    </span>
  );
}

export function CategoryIcon({ category, size = "md" }: { category: Category; size?: "sm" | "md" }) {
  const { color, icon } = CATEGORY_STYLES[category];
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-xl ${size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-lg"}`}
      style={{ backgroundColor: `${color}1f` }}
    >
      {icon}
    </span>
  );
}
