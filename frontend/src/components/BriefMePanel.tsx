"use client";

type Briefing = {
  script: string;
  audio_url: string | null;
  stub: boolean;
  message: string;
};

type Props = {
  disabled: boolean;
  busy: boolean;
  briefing: Briefing | null;
  error: string | null;
  onBrief: () => void;
};

/** Core Special Track step — spoken manager brief after Finding. */
export function BriefMePanel({
  disabled,
  busy,
  briefing,
  error,
  onBrief,
}: Props) {
  return (
    <section className="rounded-xl border border-accent/30 bg-gradient-to-br from-teal-50/90 to-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
            Voice brief · ElevenLabs
          </p>
          <h3 className="mt-1 text-lg font-semibold text-ink">Brief me</h3>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Hear Riley summarise the Finding for the manager — evidence, policy,
            and recommendation — before you authorize a refund move.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || busy}
          onClick={onBrief}
          className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {busy ? "Generating…" : briefing ? "Replay brief" : "Brief me"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

      {briefing ? (
        <div className="mt-4 space-y-3">
          {briefing.audio_url ? (
            <audio
              key={briefing.audio_url.slice(0, 64)}
              controls
              autoPlay
              className="w-full"
              src={briefing.audio_url}
            >
              Your browser does not support audio playback.
            </audio>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {briefing.message}
            </p>
          )}
          <div className="rounded-lg border border-slate-200 bg-white/80 px-3 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Script
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {briefing.script}
            </p>
          </div>
          {briefing.stub && briefing.audio_url === null ? null : (
            <p className="text-xs text-slate-500">{briefing.message}</p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Run Investigate first, then Brief me before human review.
        </p>
      )}
    </section>
  );
}
