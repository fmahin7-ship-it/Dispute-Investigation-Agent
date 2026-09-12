import { AppError } from "../middleware/errorHandler.js";
import { findCaseById } from "../repositories/caseRepository.js";
import {
  findInvestigationById,
  saveInvestigation,
  type InvestigationRecord,
} from "../repositories/investigationRepository.js";
import { runInvestigationAgent } from "./agent/investigator.js";
import type { InvestigationProgressHandler } from "./agent/progress.js";
import { appendAudit } from "./auditService.js";

export type { InvestigationRecord };

export async function runInvestigation(
  caseId: string,
  onProgress?: InvestigationProgressHandler
): Promise<InvestigationRecord> {
  const caseRow = await findCaseById(caseId);
  if (!caseRow) {
    throw new AppError(404, `Case ${caseId} not found`, "CASE_NOT_FOUND");
  }

  const finding = await runInvestigationAgent(caseRow, onProgress);

  const record: InvestigationRecord = {
    id: `inv_${caseId}_${Date.now()}`,
    case_id: caseId,
    status: "completed",
    finding,
    created_at: new Date().toISOString(),
  };

  saveInvestigation(record);
  appendAudit({
    type: "investigation_completed",
    investigation_id: record.id,
    case_id: caseId,
    recommendation: finding.recommendation,
    tools_used: finding.tools_used ?? [],
  });

  return record;
}

export async function getInvestigation(investigationId: string) {
  return findInvestigationById(investigationId);
}

export async function getInvestigationOrThrow(investigationId: string) {
  const row = await getInvestigation(investigationId);
  if (!row) {
    throw new AppError(404, "Investigation not found", "NOT_FOUND");
  }
  return row;
}
