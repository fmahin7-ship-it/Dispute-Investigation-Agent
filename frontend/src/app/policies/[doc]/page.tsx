"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPolicy } from "@/lib/api";

export default function PolicyDetailPage() {
  const params = useParams<{ doc: string }>();
  const docName = decodeURIComponent(params.doc ?? "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docName) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPolicy(docName);
        if (!cancelled) {
          setTitle(data.title);
          setContent(data.content);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load policy");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [docName]);

  return (
    <main className="animate-fade-up space-y-4">
      <Link href="/policies" className="text-sm font-semibold text-accent">
        ← All policies
      </Link>
      {loading ? <p className="text-sm text-slate-500">Loading…</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {!loading && !error ? (
        <article className="desk-panel">
          <p className="desk-kicker">Policy document</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            {title}
          </h2>
          <p className="mt-1 font-mono text-xs text-slate-400">{docName}</p>
          <div className="mt-6 border-t border-line pt-6">
            <pre className="max-w-none whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-slate-700">
              {content}
            </pre>
          </div>
        </article>
      ) : null}
    </main>
  );
}
