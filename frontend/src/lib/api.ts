import { CasesResponseSchema, InvestigationResponseSchema } from "@/schemas/cases";
import { FindingSchema, HumanDecisionSchema } from "@/schemas/finding";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function parseJson<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }
  const json: unknown = await res.json();
  return schema.parse(json);
}

export async function fetchCases() {
  const res = await fetch(`${API_URL}/api/cases`, { cache: "no-store" });
  return parseJson(res, CasesResponseSchema);
}

export async function investigate(caseId: string) {
  const res = await fetch(`${API_URL}/api/investigations/${caseId}`, {
    method: "POST",
  });
  return parseJson(res, InvestigationResponseSchema);
}

export async function decide(
  investigationId: string,
  decision: string,
  decidedBy = "manager"
) {
  const body = {
    decision: HumanDecisionSchema.parse(decision),
    decided_by: decidedBy,
  };
  const res = await fetch(
    `${API_URL}/api/investigations/${investigationId}/decision`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error("Decision failed");
  return res.json();
}

export async function brief(investigationId: string) {
  const res = await fetch(
    `${API_URL}/api/investigations/${investigationId}/brief`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Brief failed");
  return res.json();
}

export function assertFinding(data: unknown) {
  return FindingSchema.parse(data);
}
