import type { Finding } from "@/schemas/finding";

/** Person D */
export function FindingPanel({ finding }: { finding: Finding | null }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Finding
      </h3>
      {!finding ? (
        <p className="mt-3 text-sm text-slate-500">No finding yet.</p>
      ) : (
        <div className="mt-3 space-y-2 text-sm">
          <p>
            <span className="font-semibold">Recommendation:</span>{" "}
            {finding.recommendation}
          </p>
          <p>
            <span className="font-semibold">Action:</span>{" "}
            {finding.recommended_action}
          </p>
          <p>
            <span className="font-semibold">Risk:</span> {finding.risk}
          </p>
          <p>
            <span className="font-semibold">Confidence:</span>{" "}
            {finding.investigation_confidence.label}
          </p>
          <ul className="list-disc pl-5 text-slate-600">
            {finding.investigation_confidence.why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
          <p className="pt-2 text-slate-700">{finding.reason}</p>
          {finding.contradictions.length > 0 ? (
            <div>
              <p className="font-semibold text-amber-800">Contradictions</p>
              <ul className="list-disc pl-5 text-amber-900/80">
                {finding.contradictions.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
