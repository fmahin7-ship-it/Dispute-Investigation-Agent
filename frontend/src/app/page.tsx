"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCases, getApiBaseUrl } from "@/lib/api";
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
    <main>
      <h2 className="mb-4 text-lg font-semibold text-ink">Open disputes</h2>
      {loading ? (
        <p className="text-sm text-slate-500">Loading cases…</p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <ul className="space-y-3">
        {cases.map((c) => (
          <li key={c.id}>
            <Link
              href={`/cases/${c.id}`}
              className="block rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-accent"
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium text-ink">#{c.id}</span>
                <span className="text-sm text-slate-500">
                  A${c.amount_aud.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-700">{c.title}</p>
              <p className="mt-2 text-sm italic text-slate-500">
                “{c.customer_message}”
              </p>
              <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                {c.claim_type.replaceAll("_", " ")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
