import type { Finding } from "../schemas/finding.js";
import { getInvestigationOrThrow } from "./investigationService.js";
import { synthesizeBrief } from "./voice/elevenlabs.js";
import { appendAudit } from "./auditService.js";

/** Spoken manager brief — short, evidence-led, no refund automation claim. */
export function buildBriefingScript(caseId: string, finding: Finding): string {
  const evidenceBits = finding.evidence
    .slice(0, 3)
    .map((e) => e.fact)
    .filter(Boolean);
  const contradictions =
    finding.contradictions.length > 0
      ? `Contradictions noted: ${finding.contradictions.slice(0, 2).join("; ")}.`
      : "No major contradictions flagged.";
  const policies =
    finding.policy_citations.length > 0
      ? `Policy cited: ${finding.policy_citations
          .slice(0, 2)
          .map((p) => p.doc.replace(/\.md$/i, ""))
          .join(", ")}.`
      : "";

  return [
    `Manager brief for NovaCart case ${caseId}.`,
    `Claim type: ${finding.claim_type.replace(/_/g, " ")}.`,
    `Riley recommends ${finding.recommendation}, with action ${finding.recommended_action.replace(/_/g, " ")}.`,
    `Risk is ${finding.risk}. Investigation confidence is ${finding.investigation_confidence.label}.`,
    evidenceBits.length > 0
      ? `Key evidence: ${evidenceBits.join(" ")}`
      : "",
    contradictions,
    policies,
    finding.reason,
    "This is a recommendation only. Please authorize the next action in human review.",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Build and synthesize a manager voice brief for an investigation. */
export async function createBriefing(investigationId: string) {
  const inv = await getInvestigationOrThrow(investigationId);
  const text = buildBriefingScript(inv.case_id, inv.finding);
  const audio = await synthesizeBrief(text);

  appendAudit({
    type: "voice_brief_created",
    investigation_id: investigationId,
    stub: audio.stub,
  });

  return {
    investigation_id: investigationId,
    stub: audio.stub,
    audio_url: audio.audio_url,
    mime_type: audio.mime_type,
    message: audio.message,
    script: text,
  };
}
