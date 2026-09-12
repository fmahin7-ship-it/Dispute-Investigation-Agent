import type { Finding } from "../schemas/finding.js";

export type InvestigationRecord = {
  id: string;
  case_id: string;
  status: "completed" | "failed";
  finding: Finding;
  created_at: string;
};

const store = new Map<string, InvestigationRecord>();

/** In-memory — Person B replaces with DB */
export function saveInvestigation(record: InvestigationRecord) {
  store.set(record.id, record);
  return record;
}

export function findInvestigationById(id: string) {
  return store.get(id) ?? null;
}

export function listInvestigations() {
  return [...store.values()];
}
