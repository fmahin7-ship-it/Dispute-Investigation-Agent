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
    <main>
      <h2 className="mb-2 text-lg font-semibold text-ink">
        NovaCart policy library
      </h2>
      <p className="mb-6 max-w-2xl text-sm text-slate-600">
        These documents power policy retrieval during investigation. The agent
        cites relevant sections in each Finding.
      </p>
      {loading ? (
        <p className="text-sm text-slate-500">Loading policies…</p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <ul className="space-y-3">
        {policies.map((p) => (
          <li key={p.doc}>
            <Link
              href={`/policies/${encodeURIComponent(p.doc)}`}
              className="block rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-accent"
            >
              <p className="font-medium text-ink">{p.title}</p>
              <p className="mt-1 text-xs text-slate-400">{p.doc}</p>
              <p className="mt-2 text-sm text-slate-600">{p.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
