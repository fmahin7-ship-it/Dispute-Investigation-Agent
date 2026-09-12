import type { Finding } from "@/schemas/finding";

export function EvidencePanel({ finding }: { finding: Finding | null }) {
  return (
    <section className="desk-panel h-full">
      <h3 className="desk-section-label">Evidence</h3>
      {!finding ? (
        <p className="desk-empty">
          Run Investigate to collect evidence from order, tracking, and history
          tools.
        </p>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {finding.evidence.map((e, i) => (
            <li
              key={`${e.source}-${e.id}-${i}`}
              className="rounded-xl border border-slate-300/50 bg-white/35 px-3 py-2.5 text-sm"
            >
              <span className="font-mono text-[11px] font-semibold text-accent">
                {e.source}
              </span>
              <p className="mt-1 leading-relaxed text-slate-700">{e.fact}</p>
            </li>
          ))}
          {finding.contradictions.length > 0 ? (
            <li className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm">
              <span className="font-semibold text-amber-950">Contradictions</span>
              <ul className="mt-2 space-y-1 text-amber-950/85">
                {finding.contradictions.map((c, i) => (
                  <li key={`contradiction-${i}`} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-amber-600" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </li>
          ) : null}
          {finding.policy_citations.map((p, i) => (
            <li
              key={`${p.doc}-${i}`}
              className="rounded-xl border border-teal-100 bg-accent-soft/50 px-3 py-2.5 text-sm"
            >
              <span className="font-semibold text-accent">
                Policy · {p.doc}
                {p.section ? ` · ${p.section}` : ""}
              </span>
              <p className="mt-1 line-clamp-4 leading-relaxed text-slate-600">
                “{p.quote}”
              </p>
            </li>
          ))}
          {finding.tools_used && finding.tools_used.length > 0 ? (
            <li className="pt-1 font-mono text-[11px] text-slate-400">
              Tools used: {finding.tools_used.join(", ")}
            </li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
