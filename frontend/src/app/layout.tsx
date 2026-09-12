import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Riley — Ecommerce Dispute Investigator",
  description:
    "Investigate disputes with evidence + policy before any refund moves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
          <header className="mb-8 border-b border-slate-200 pb-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  NovaCart · Operator Desk
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">
                  Riley — Dispute Investigator
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600">
                  We don&apos;t automate refunds. We automate the investigation
                  before the refund.
                </p>
              </div>
              <nav className="flex gap-2 text-sm font-semibold">
                <Link
                  href="/"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-ink hover:border-accent"
                >
                  Cases
                </Link>
                <Link
                  href="/policies"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-ink hover:border-accent"
                >
                  Policies
                </Link>
              </nav>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
