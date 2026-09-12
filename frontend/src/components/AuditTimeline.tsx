/** High-level audit only — live tool steps live in the Investigate modal */
export function AuditTimeline({
  lines,
  title = "Audit",
}: {
  lines: string[];
  title?: string;
}) {
  return (
    <section className="desk-panel">
      <h3 className="desk-section-label">{title}</h3>
      {lines.length === 0 ? (
        <p className="desk-empty">No events yet.</p>
      ) : (
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
          {lines.map((line, i) => (
            <li key={`${i}-${line}`}>{line}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
