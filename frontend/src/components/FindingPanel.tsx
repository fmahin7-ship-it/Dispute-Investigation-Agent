import type { Finding } from "@/schemas/finding";

const recommendationStyle: Record<string, string> = {
  HOLD: "bg-amber-100 text-amber-950",
  APPROVE: "bg-emerald-100 text-emerald-950",
  REQUEST_INFO: "bg-sky-100 text-sky-950",
  ESCALATE: "bg-orange-100 text-orange-950",
  REJECT: "bg-rose-100 text-rose-950",
};

export function FindingPanel({ finding }: { finding: Finding | null }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        Finding
      </h3>
      {!finding ? (
        <p className="mt-3 text-sm text-slate-500">No finding yet.</p>
      ) : (
        <div className="mt-3 space-y-3 text-sm">
          <p>
            <span
              className={`inline-block rounded-md px-2 py-1 text-xs font-bold tracking-wide ${
                recommendationStyle[finding.recommendation] ??
                "bg-slate-100 text-slate-800"
              }`}
            >
              {finding.recommendation}
            </span>
          </p>
          <p>
            <span className="font-semibold">Action:</span>{" "}
            {finding.recommended_action}
          </p>
          <p>
            <span className="font-semibold">Risk:</span> {finding.risk}
          </p>
          <div>
            <p className="font-semibold">
              Confidence: {finding.investigation_confidence.label}
            </p>
            <ul className="mt-1 list-disc pl-5 text-slate-600">
              {finding.investigation_confidence.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
          <p className="border-t border-slate-100 pt-3 text-slate-700">
            {finding.reason}
          </p>
        </div>
      )}
    </section>
  );
}
