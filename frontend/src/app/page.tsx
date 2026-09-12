"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCases, getApiBaseUrl } from "@/lib/api";
import { formatLabel } from "@/lib/formatLabel";
import type { CaseSummary } from "@/schemas/cases";

export default function HomePage() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCases();
        if (!cancelled) setCases(data.cases);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? `${e.message} — is the API running at ${getApiBaseUrl()}?`
              : "Failed to load cases"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="animate-fade-up" style={{ animationDelay: "80ms" }}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">
            Open disputes
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Select a case to investigate with tools, policy, and human review.
          </p>
        </div>
        {!loading && !error ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {cases.length} in queue
          </p>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading cases…</p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}

      <ul className="space-y-3">
        {cases.map((c, i) => (
          <li
            key={c.id}
            className="animate-fade-up"
            style={{ animationDelay: `${120 + i * 60}ms` }}
          >
            <Link
              href={`/cases/${c.id}`}
              className="group desk-panel block !p-4 transition hover:-translate-y-0.5 hover:border-accent/50"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-semibold text-ink">
                    #{c.id}
                  </span>
                  <span className="claim-chip">
                    {formatLabel(c.claim_type)}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums text-accent">
                  A${c.amount_aud.toLocaleString()}
                </span>
              </div>
              <p className="mt-2 font-medium text-ink group-hover:text-accent">
                {c.title}
              </p>
              <p className="mt-2 line-clamp-2 text-sm italic leading-relaxed text-slate-500">
                “{c.customer_message}”
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
