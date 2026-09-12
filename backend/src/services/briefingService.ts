import { getInvestigationOrThrow } from "./investigationService.js";
import { synthesizeBrief } from "./voice/elevenlabs.js";
import { appendAudit } from "./auditService.js";

/** Person D — ElevenLabs briefing */
export async function createBriefing(investigationId: string) {
  const inv = await getInvestigationOrThrow(investigationId);

  const text = [
    `Case ${inv.case_id}.`,
    `Recommendation: ${inv.finding.recommendation}.`,
    inv.finding.reason,
  ].join(" ");

  const audio = await synthesizeBrief(text);
  appendAudit({
    type: "voice_brief_created",
    investigation_id: investigationId,
  });

  return { investigation_id: investigationId, ...audio, script: text };
}
