"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPolicies, getApiBaseUrl } from "@/lib/api";

type PolicyItem = { doc: string; title: string; summary: string };

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPolicies();
        if (!cancelled) setPolicies(data.policies);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? `${e.message} — is the API running at ${getApiBaseUrl()}?`
              : "Failed to load policies"
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
      <div className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Policy library
        </h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          These documents power retrieval during investigation. Findings cite
          the sections that shaped the recommendation.
        </p>
      </div>
      {loading ? (
        <p className="text-sm text-slate-500">Loading policies…</p>
      ) : null}
      {error ? (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      ) : null}
      <ul className="grid gap-3 md:grid-cols-2">
        {policies.map((p, i) => (
          <li
            key={p.doc}
            className="animate-fade-up"
            style={{ animationDelay: `${100 + i * 50}ms` }}
          >
            <Link
              href={`/policies/${encodeURIComponent(p.doc)}`}
              className="desk-panel group block h-full !p-4 transition hover:-translate-y-0.5 hover:border-accent/50"
            >
              <p className="font-display text-lg font-semibold text-ink group-hover:text-accent">
                {p.title}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-400">{p.doc}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {p.summary}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
