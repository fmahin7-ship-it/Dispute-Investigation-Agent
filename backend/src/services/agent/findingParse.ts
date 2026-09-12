import type { Finding } from "../../schemas/finding.js";
import { FindingSchema } from "../../schemas/finding.js";
import type { CaseSummary } from "../../schemas/cases.js";

/** Pull the first JSON object from model text (raw or fenced). */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Model response did not contain a JSON object");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

/** Validate Finding JSON and anchor identity to the loaded case. */
export function parseFinding(
  rawText: string,
  caseRow: CaseSummary,
  toolsUsed: string[]
): Finding {
  const raw = extractJsonObject(rawText);
  if (!raw || typeof raw !== "object") {
    throw new Error("Finding payload is not an object");
  }

  const body = raw as Record<string, unknown>;

  return FindingSchema.parse({
    ...body,
    case_id: caseRow.id,
    claim_type: caseRow.claim_type,
    tools_used:
      toolsUsed.length > 0
        ? toolsUsed
        : Array.isArray(body.tools_used)
          ? body.tools_used
          : [],
  });
}
