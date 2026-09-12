type Props = {
  disabled: boolean;
  onDecide: (decision: string) => void;
  onBrief: () => void;
};

/** Person D — HITL + Brief me */
export function HitlActions({ disabled, onDecide, onBrief }: Props) {
  const decisions = ["APPROVE", "REJECT", "ESCALATE", "REQUEST_INFO"] as const;

  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Human review
          </h3>
          <p className="text-xs text-slate-500">
            Role: Manager (approval boundary — not full RBAC in hackathon)
          </p>
        </div>
        <button
          type="button"
          disabled={disabled}
          onClick={onBrief}
          className="rounded-lg border border-accent px-3 py-2 text-sm font-semibold text-accent disabled:opacity-50"
        >
          Brief me
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {decisions.map((d) => (
          <button
            key={d}
            type="button"
            disabled={disabled}
            onClick={() => onDecide(d)}
            className="rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            {d}
          </button>
        ))}
      </div>
    </section>
  );
}
