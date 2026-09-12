import type { Finding } from "@/schemas/finding";

export function EvidencePanel({ finding }: { finding: Finding | null }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Evidence
      </h3>
      {!finding ? (
        <p className="mt-3 text-sm text-slate-500">
          Run Investigate to collect evidence from order, tracking, and history
          tools.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {finding.evidence.map((e, i) => (
            <li
              key={`${e.source}-${e.id}-${i}`}
              className="rounded-lg border border-slate-100 bg-panel px-3 py-2 text-sm"
            >
              <span className="font-medium text-ink">{e.source}</span>
              <p className="text-slate-600">{e.fact}</p>
            </li>
          ))}
          {finding.contradictions.length > 0 ? (
            <li className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
              <span className="font-medium text-amber-900">Contradictions</span>
              <ul className="mt-1 list-disc pl-4 text-amber-950/80">
                {finding.contradictions.map((c, i) => (
                  <li key={`contradiction-${i}`}>{c}</li>
                ))}
              </ul>
            </li>
          ) : null}
          {finding.policy_citations.map((p, i) => (
            <li
              key={`${p.doc}-${i}`}
              className="rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-sm"
            >
              <span className="font-medium text-accent">
                Policy · {p.doc}
                {p.section ? ` · ${p.section}` : ""}
              </span>
              <p className="mt-1 line-clamp-4 text-slate-600">“{p.quote}”</p>
            </li>
          ))}
          {finding.tools_used && finding.tools_used.length > 0 ? (
            <li className="text-xs text-slate-400">
              Tools used: {finding.tools_used.join(", ")}
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
