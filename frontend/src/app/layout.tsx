import type { Metadata } from "next";
import Link from "next/link";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Dispute Investigator — NovaCart",
  description:
    "Investigate disputes with evidence + policy before any refund moves.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans antialiased">
        <div className="app-shell mx-auto min-h-screen max-w-6xl px-4 py-8 md:py-10">
          <header className="mb-10 animate-fade-up">
            <div className="desk-panel !py-6">
              <div className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="desk-kicker">NovaCart · Operator Desk</p>
                  <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink md:text-[2.75rem]">
                    Dispute Investigator
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                    We don&apos;t automate refunds. We automate the
                    investigation before the refund.
                  </p>
                </div>
                <nav className="flex gap-2">
                  <Link href="/" className="nav-link">
                    Cases
                  </Link>
                  <Link href="/policies" className="nav-link">
                    Policies
                  </Link>
                </nav>
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
