import type { Finding } from "@/schemas/finding";
import { formatLabel } from "@/lib/formatLabel";

const recommendationStyle: Record<string, string> = {
  HOLD: "bg-amber-100/90 text-amber-950 border-amber-300/80",
  APPROVE: "bg-emerald-100/90 text-emerald-950 border-emerald-300/80",
  REQUEST_INFO: "bg-sky-100/90 text-sky-950 border-sky-300/80",
  ESCALATE: "bg-orange-100/90 text-orange-950 border-orange-300/80",
  REJECT: "bg-rose-100/90 text-rose-950 border-rose-300/80",
};

export function FindingPanel({ finding }: { finding: Finding | null }) {
  return (
    <section className="desk-panel h-full">
      <h3 className="desk-section-label">Finding</h3>
      {!finding ? (
        <p className="desk-empty">
          No finding yet — run Investigate to generate a recommendation.
        </p>
      ) : (
        <div className="mt-4 space-y-4 text-sm">
          <p>
            <span
              className={`inline-block rounded-md border px-2.5 py-1 text-xs font-bold tracking-wide ${
                recommendationStyle[finding.recommendation] ??
                "border-slate-300 bg-slate-100 text-slate-800"
              }`}
            >
              {formatLabel(finding.recommendation)}
            </span>
          </p>
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="meta-tile">
              <dt className="text-xs font-medium text-slate-500">Action</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {formatLabel(finding.recommended_action)}
              </dd>
            </div>
            <div className="meta-tile">
              <dt className="text-xs font-medium text-slate-500">Risk</dt>
              <dd className="mt-0.5 font-medium text-ink">
                {formatLabel(finding.risk)}
              </dd>
            </div>
          </dl>
          <div>
            <p className="font-semibold text-ink">
              Confidence: {formatLabel(finding.investigation_confidence.label)}
            </p>
            <ul className="mt-2 space-y-1.5 text-slate-600">
              {finding.investigation_confidence.why.map((w) => (
                <li key={w} className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-sm bg-accent" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="border-t border-slate-300/50 pt-4 leading-relaxed text-slate-700">
            {finding.reason}
          </p>
        </div>
      )}
    </section>
  );
}
