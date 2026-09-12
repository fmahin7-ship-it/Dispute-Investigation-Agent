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

/** Spoken manager brief after Finding. */
export function BriefMePanel({
  disabled,
  busy,
  briefing,
  error,
  onBrief,
}: Props) {
  return (
    <section className="desk-panel relative overflow-hidden !border-l-accent">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full bg-accent/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-16 h-24 w-24 rounded-full bg-accent/5"
        aria-hidden
      />

      <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="desk-kicker">Step · Voice brief</p>
          <h3 className="mt-1 font-display text-2xl font-semibold text-ink">
            Brief me
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Play a short spoken summary of the Finding — evidence, policy cites,
            and recommendation — so the manager can decide with context.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
            <li className="rounded-md border border-slate-300/70 bg-white/50 px-2.5 py-1">
              Evidence highlights
            </li>
            <li className="rounded-md border border-slate-300/70 bg-white/50 px-2.5 py-1">
              Policy cites
            </li>
            <li className="rounded-md border border-slate-300/70 bg-white/50 px-2.5 py-1">
              Recommendation
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-stretch gap-3 md:min-w-[200px]">
          <div
            className="flex h-12 items-end justify-center gap-1 rounded-xl border border-accent/25 bg-accent-soft/70 px-4 py-2"
            aria-hidden
          >
            {[4, 9, 6, 12, 7, 11, 5, 10, 6, 8].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-sm bg-accent/70"
                style={{
                  height: `${h * 2}px`,
                  animation: busy
                    ? `investigate-detail-pulse 0.9s ease-in-out ${i * 0.05}s infinite`
                    : undefined,
                }}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={disabled || busy}
            onClick={onBrief}
            className="btn-primary w-full"
          >
            {busy ? "Generating…" : briefing ? "Replay brief" : "Brief me"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="relative mt-4 text-sm text-rose-700">{error}</p>
      ) : null}

      {briefing ? (
        <div className="relative mt-5 space-y-3 border-t border-slate-300/50 pt-4">
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
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              {briefing.message}
            </p>
          )}
          <div className="rounded-xl border border-slate-300/60 bg-white/45 px-3 py-3">
            <p className="text-xs font-semibold text-slate-500">Script</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-700">
              {briefing.script}
            </p>
          </div>
          {briefing.stub && briefing.audio_url === null ? null : (
            <p className="text-xs text-slate-500">{briefing.message}</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
