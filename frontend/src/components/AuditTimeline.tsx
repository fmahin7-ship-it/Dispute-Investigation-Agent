/** High-level audit only — live tool steps live in the Investigate modal */
export function AuditTimeline({
  lines,
  title = "Audit",
}: {
  lines: string[];
  title?: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {lines.length === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No events yet.</p>
      ) : (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
          {lines.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
