import { AppError } from "../middleware/errorHandler.js";
import { findCaseById, listDemoCases } from "../repositories/caseRepository.js";

export async function listCases() {
  return listDemoCases();
}

export async function getCaseById(caseId: string) {
  const row = await findCaseById(caseId);
  if (!row) {
    throw new AppError(404, `Case ${caseId} not found`, "CASE_NOT_FOUND");
  }
  return row;
}
