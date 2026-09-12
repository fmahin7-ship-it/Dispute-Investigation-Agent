type Props = {
  disabled: boolean;
  onDecide: (decision: string) => void;
};

const decisions = [
  {
    value: "APPROVE",
    label: "Approve",
    className:
      "border-emerald-700/30 bg-emerald-50 text-emerald-950 hover:bg-emerald-100",
  },
  {
    value: "REJECT",
    label: "Reject",
    className: "border-rose-700/30 bg-rose-50 text-rose-950 hover:bg-rose-100",
  },
  {
    value: "ESCALATE",
    label: "Escalate",
    className:
      "border-orange-700/30 bg-orange-50 text-orange-950 hover:bg-orange-100",
  },
  {
    value: "REQUEST_INFO",
    label: "Request info",
    className: "border-sky-700/30 bg-sky-50 text-sky-950 hover:bg-sky-100",
  },
] as const;

export function HitlActions({ disabled, onDecide }: Props) {
  return (
    <section className="desk-panel">
      <div>
        <h3 className="desk-section-label">Human review</h3>
        <p className="mt-1 text-sm text-slate-600">
          Manager authorizes the next action. AI recommendation stays on record.
        </p>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {decisions.map((d) => (
          <button
            key={d.value}
            type="button"
            disabled={disabled}
            onClick={() => onDecide(d.value)}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold normal-case tracking-normal transition disabled:opacity-45 ${d.className}`}
          >
            {d.label}
          </button>
        ))}
      </div>
    </section>
  );
}
