import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions.js";
import { executeTool } from "../tools/index.js";
import {
  emitProgress,
  type InvestigationProgressHandler,
} from "./progress.js";

function parseToolArgs(raw: string | undefined): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function runOneToolCall(
  call: ChatCompletionMessageToolCall,
  toolsUsed: Set<string>,
  caseId: string,
  round: number,
  onProgress?: InvestigationProgressHandler
): Promise<ChatCompletionMessageParam> {
  const name = call.function.name;
  toolsUsed.add(name);
  const args = parseToolArgs(call.function.arguments);

  emitProgress(onProgress, {
    type: "tool_start",
    case_id: caseId,
    round,
    tool: name,
    args,
  });

  let payload: unknown;
  let ok = true;
  let errorMsg: string | undefined;
  try {
    payload = await executeTool(name, args);
  } catch (err) {
    ok = false;
    errorMsg = err instanceof Error ? err.message : String(err);
    payload = { error: true, tool: name, message: errorMsg };
  }

  emitProgress(onProgress, {
    type: "tool_done",
    case_id: caseId,
    round,
    tool: name,
    ok,
    error: errorMsg,
  });

  return {
    role: "tool",
    tool_call_id: call.id,
    content: JSON.stringify(payload),
  };
}

/** Execute model tool_calls in parallel; record names into toolsUsed. */
export async function runToolCalls(
  toolCalls: ChatCompletionMessageToolCall[],
  toolsUsed: Set<string>,
  caseId: string,
  round: number,
  onProgress?: InvestigationProgressHandler
): Promise<ChatCompletionMessageParam[]> {
  return Promise.all(
    toolCalls.map((call) =>
      runOneToolCall(call, toolsUsed, caseId, round, onProgress)
    )
  );
}
