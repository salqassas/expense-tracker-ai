"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useExpenseEditor } from "./ExpenseEditorProvider";
import { HomeIcon, ListIcon, PlusIcon, WalletIcon } from "./Icons";

const NAV = [
  { href: "/", label: "Dashboard", icon: HomeIcon },
  { href: "/expenses", label: "Expenses", icon: ListIcon },
];

export function AppHeader() {
  const pathname = usePathname();
  const { openCreate } = useExpenseEditor();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <WalletIcon className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">Spendwise</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-xl bg-slate-100 p-1 sm:flex" aria-label="Main">
            {NAV.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                    active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <button type="button" onClick={openCreate} className="btn-primary hidden sm:inline-flex">
            <PlusIcon className="h-4 w-4" />
            Add expense
          </button>
        </div>
      </header>

      {/* Mobile bottom navigation with a prominent add button. */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
      >
        <div className="grid grid-cols-3 items-center">
          {NAV.slice(0, 1).map((item) => (
            <MobileLink key={item.href} {...item} active={pathname === item.href} />
          ))}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={openCreate}
              aria-label="Add expense"
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition active:scale-95"
            >
              <PlusIcon className="h-6 w-6" />
            </button>
          </div>
          {NAV.slice(1).map((item) => (
            <MobileLink key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>
      </nav>
    </>
  );
}

function MobileLink({
  href,
  label,
  icon: Icon,
  active,
}: (typeof NAV)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
        active ? "text-brand-600" : "text-slate-500"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
