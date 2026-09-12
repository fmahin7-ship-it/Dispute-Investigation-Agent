import { DEMO_CASES, type CaseSummary } from "../schemas/cases.js";

/** Person B — replace with SQLite/Postgres queries */
export async function listDemoCases(): Promise<CaseSummary[]> {
  return DEMO_CASES.filter((c) => c.demo);
}

export async function findCaseById(
  caseId: string
): Promise<CaseSummary | null> {
  return DEMO_CASES.find((c) => c.id === caseId) ?? null;
}
