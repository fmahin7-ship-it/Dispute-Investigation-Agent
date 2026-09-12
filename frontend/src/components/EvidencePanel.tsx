import type { Finding } from "@/schemas/finding";

/** Person D — evidence cards */
export function EvidencePanel({ finding }: { finding: Finding | null }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Evidence
      </h3>
      {!finding ? (
        <p className="mt-3 text-sm text-slate-500">
          Run Investigate to collect evidence.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {finding.evidence.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-slate-100 bg-panel px-3 py-2 text-sm"
            >
              <span className="font-medium text-ink">{e.source}</span>
              <p className="text-slate-600">{e.fact}</p>
            </li>
          ))}
          {finding.policy_citations.map((p, i) => (
            <li
              key={`${p.doc}-${i}`}
              className="rounded-lg border border-teal-100 bg-teal-50/60 px-3 py-2 text-sm"
            >
              <span className="font-medium text-accent">Policy · {p.doc}</span>
              <p className="text-slate-600">“{p.quote}”</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
