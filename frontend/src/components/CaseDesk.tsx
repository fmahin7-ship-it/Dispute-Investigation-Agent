"use client";

import { useState } from "react";
import { DEMO_CASES } from "@/schemas/cases";
import type { Finding } from "@/schemas/finding";
import { brief, decide, investigate } from "@/lib/api";
import { EvidencePanel } from "@/components/EvidencePanel";
import { FindingPanel } from "@/components/FindingPanel";
import { HitlActions } from "@/components/HitlActions";
import { AuditTimeline } from "@/components/AuditTimeline";

type Props = { caseId: string };

/**
 * Person D — wire Investigate → Finding → HITL → Brief me.
 * Skeleton shows layout; agent/tools still stubs on API.
 */
export function CaseDesk({ caseId }: Props) {
  const caseRow = DEMO_CASES.find((c) => c.id === caseId);
  const [investigationId, setInvestigationId] = useState<string | null>(null);
  const [finding, setFinding] = useState<Finding | null>(null);
  const [audit, setAudit] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [briefScript, setBriefScript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!caseRow) {
    return <p className="text-red-600">Unknown case {caseId}</p>;
  }

  async function onInvestigate() {
    setBusy(true);
    setError(null);
    try {
      const result = await investigate(caseId);
      setInvestigationId(result.id);
      setFinding(result.finding);
      setAudit((a) => [
        ...a,
        `${new Date().toLocaleTimeString()} Investigation completed → ${result.finding.recommendation}`,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Investigate failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDecide(decision: string) {
    if (!investigationId) return;
    setBusy(true);
    setError(null);
    try {
      await decide(investigationId, decision);
      setAudit((a) => [
        ...a,
        `${new Date().toLocaleTimeString()} Human decision → ${decision} (Manager)`,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Decision failed");
    } finally {
      setBusy(false);
    }
  }

  async function onBrief() {
    if (!investigationId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await brief(investigationId);
      setBriefScript(result.script ?? null);
      setAudit((a) => [
        ...a,
        `${new Date().toLocaleTimeString()} Voice brief requested`,
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Brief failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Case #{caseRow.id}
            </p>
            <h2 className="text-xl font-semibold text-ink">{caseRow.title}</h2>
            <p className="mt-2 text-sm italic text-slate-600">
              “{caseRow.customer_message}”
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={onInvestigate}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Working…" : "Investigate"}
          </button>
        </div>
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <EvidencePanel finding={finding} />
        <FindingPanel finding={finding} />
      </div>

      <HitlActions
        disabled={!finding || busy}
        onDecide={onDecide}
        onBrief={onBrief}
      />

      {briefScript ? (
        <section className="rounded-xl border border-dashed border-accent/40 bg-white/70 p-4 text-sm text-slate-700">
          <p className="font-semibold text-accent">Brief script</p>
          <p className="mt-2">{briefScript}</p>
        </section>
      ) : null}

      <AuditTimeline lines={audit} />
    </div>
  );
}
