import {
  CaseResponseSchema,
  CasesResponseSchema,
  InvestigationResponseSchema,
  PoliciesResponseSchema,
  PolicyDetailSchema,
} from "@/schemas/cases";
import { FindingSchema, HumanDecisionSchema } from "@/schemas/finding";
import { z } from "zod";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function parseJson<T>(res: Response, schema: z.ZodType<T>): Promise<T> {
  if (!res.ok) {
    const body = await res.text();
    try {
      const json = JSON.parse(body) as { error?: string };
      throw new Error(json.error || body || `API ${res.status}`);
    } catch (e) {
      if (e instanceof SyntaxError) {
        throw new Error(body || `API ${res.status}`);
      }
      throw e;
    }
  }
  const json: unknown = await res.json();
  return schema.parse(json);
}

export async function fetchCases() {
  const res = await fetch(`${API_URL}/api/cases`, { cache: "no-store" });
  return parseJson(res, CasesResponseSchema);
}

export async function fetchCase(caseId: string) {
  const res = await fetch(`${API_URL}/api/cases/${caseId}`, {
    cache: "no-store",
  });
  return parseJson(res, CaseResponseSchema);
}

export async function investigate(caseId: string) {
  const res = await fetch(`${API_URL}/api/investigations/${caseId}`, {
    method: "POST",
  });
  return parseJson(res, InvestigationResponseSchema);
}

/** Agent live progress from POST /api/investigations/:caseId/stream */
export type InvestigateProgressEvent = {
  type: string;
  case_id?: string;
  round?: number;
  max_rounds?: number;
  mode?: string;
  tool?: string;
  args?: Record<string, unknown>;
  ok?: boolean;
  error?: string;
  recommendation?: string;
  tools_used?: string[];
  message?: string;
};

export function formatInvestigateProgress(
  event: InvestigateProgressEvent
): string | null {
  const t = new Date().toLocaleTimeString();
  switch (event.type) {
    case "started":
      return `${t} Agent started`;
    case "round_start":
      return `${t} Round ${event.round}/${event.max_rounds} (${event.mode})`;
    case "tool_start":
      return `${t} → ${event.tool}(${JSON.stringify(event.args ?? {})})`;
    case "tool_done":
      return event.ok
        ? `${t} ✓ ${event.tool}`
        : `${t} ✗ ${event.tool}: ${event.error ?? "failed"}`;
    case "finding_ready":
      return `${t} Finding ready → ${event.recommendation}`;
    default:
      return null;
  }
}

export async function investigateWithProgress(
  caseId: string,
  onProgress: (event: InvestigateProgressEvent) => void
): Promise<z.infer<typeof InvestigationResponseSchema>> {
  const res = await fetch(`${API_URL}/api/investigations/${caseId}/stream`, {
    method: "POST",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body || `API ${res.status}`);
  }
  if (!res.body) {
    throw new Error("No response stream from investigation");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const state: {
    complete: z.infer<typeof InvestigationResponseSchema> | null;
    streamError: string | null;
  } = { complete: null, streamError: null };

  const consumeBlock = (block: string) => {
    const lines = block.split("\n");
    let eventName = "message";
    const dataLines: string[] = [];
    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLines.push(line.slice(5).trim());
      }
    }
    if (dataLines.length === 0) return;
    const raw = dataLines.join("\n");
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return;
    }

    if (eventName === "progress" && data && typeof data === "object") {
      onProgress(data as InvestigateProgressEvent);
    } else if (eventName === "complete") {
      state.complete = InvestigationResponseSchema.parse(data);
    } else if (
      eventName === "error" &&
      data &&
      typeof data === "object" &&
      "message" in data
    ) {
      state.streamError = String((data as { message: unknown }).message);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (block.trim()) consumeBlock(block);
    }
  }
  if (buffer.trim()) consumeBlock(buffer);

  if (state.streamError) throw new Error(state.streamError);
  if (!state.complete) {
    throw new Error("Investigation stream ended without a result");
  }
  return state.complete;
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

export const BriefingResponseSchema = z.object({
  investigation_id: z.string(),
  stub: z.boolean(),
  audio_url: z.string().nullable(),
  mime_type: z.string().optional(),
  message: z.string(),
  script: z.string(),
});
export type BriefingResponse = z.infer<typeof BriefingResponseSchema>;

export async function briefInvestigation(investigationId: string) {
  const res = await fetch(
    `${API_URL}/api/investigations/${investigationId}/brief`,
    { method: "POST" }
  );
  return parseJson(res, BriefingResponseSchema);
}

export async function fetchPolicies() {
  const res = await fetch(`${API_URL}/api/policies`, { cache: "no-store" });
  return parseJson(res, PoliciesResponseSchema);
}

export async function fetchPolicy(docName: string) {
  const res = await fetch(
    `${API_URL}/api/policies/${encodeURIComponent(docName)}`,
    { cache: "no-store" }
  );
  return parseJson(res, PolicyDetailSchema);
}

export function assertFinding(data: unknown) {
  return FindingSchema.parse(data);
}

export function getApiBaseUrl() {
  return API_URL;
}
