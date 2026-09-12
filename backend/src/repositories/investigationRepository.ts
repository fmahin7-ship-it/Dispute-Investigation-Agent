import type { Finding } from "../schemas/finding.js";

export type InvestigationRecord = {
  id: string;
  case_id: string;
  status: "completed" | "failed";
  finding: Finding;
  created_at: string;
};

/**
 * In-memory investigation store — left for Persons A/D.
 * Ops reads (cases/orders/tools) use Postgres; migrating investigations
 * to the `investigations` table is out of Person B scope.
 */
const store = new Map<string, InvestigationRecord>();

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
