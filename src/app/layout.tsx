import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: { default: "Spendwise — Expense Tracker", template: "%s · Spendwise" },
  description: "Track, filter and analyze your personal expenses.",
};

export const viewport: Viewport = {
  themeColor: "#1f48eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppHeader />
          <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
