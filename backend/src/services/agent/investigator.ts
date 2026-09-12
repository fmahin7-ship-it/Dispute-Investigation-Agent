import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from "openai/resources/chat/completions.js";
import type { Finding } from "../../schemas/finding.js";
import { FindingSchema } from "../../schemas/finding.js";
import type { CaseSummary } from "../../schemas/cases.js";
import { getChatModel, getLlmClient } from "../../llm/client.js";
import { executeTool } from "../tools/index.js";
import { AppError } from "../../middleware/errorHandler.js";
import { TOOL_DEFINITIONS } from "./toolDefinitions.js";
import {
  FINALIZE_USER_PROMPT,
  INVESTIGATOR_SYSTEM_PROMPT,
} from "./prompts.js";
import {
  formatProgressLog,
  type InvestigationProgressHandler,
} from "./progress.js";

/** Architecture: bounded native tool loop — max 3 LLM rounds (no LangGraph). */
const MAX_LLM_ROUNDS = 3;

function emit(
  onProgress: InvestigationProgressHandler | undefined,
  event: Parameters<InvestigationProgressHandler>[0]
) {
  console.log(formatProgressLog(event));
  onProgress?.(event);
}

type AgentCaseContext = {
  case_id: string;
  title: string;
  customer_message: string;
  claim_type: string;
  amount_aud: number;
  order_id: string;
  customer_id: string;
};

/**
 * Strip answer-key fields before the model sees the case.
 * expected_recommendation / expected_action are eval labels only — never LLM input.
 */
function toAgentCaseContext(caseRow: CaseSummary): AgentCaseContext {
  return {
    case_id: caseRow.id,
    title: caseRow.title,
    customer_message: caseRow.customer_message,
    claim_type: caseRow.claim_type,
    amount_aud: caseRow.amount_aud,
    order_id: caseRow.order_id,
    customer_id: caseRow.customer_id,
  };
}

function buildInitialUserMessage(ctx: AgentCaseContext): string {
  return [
    "Investigate this NovaCart dispute and produce a Finding.",
    "",
    "Case context (ops keys for tools):",
    JSON.stringify(ctx, null, 2),
    "",
    "Suggested first-round tools (call in parallel as needed):",
    `- get_order with order_id "${ctx.order_id}"`,
    `- claim-relevant ops tools for claim_type "${ctx.claim_type}"`,
    `- get_customer_history with customer_id "${ctx.customer_id}" when INR / high-value / risk`,
    `- search_policy with a specific query for this claim`,
  ].join("\n");
}

function extractJsonObject(text: string): unknown {
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

function parseFinding(
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
    // Anchor identity to the loaded case — never invent a different case.
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

async function runToolCalls(
  toolCalls: ChatCompletionMessageToolCall[],
  toolsUsed: Set<string>,
  caseId: string,
  round: number,
  onProgress?: InvestigationProgressHandler
): Promise<ChatCompletionMessageParam[]> {
  return Promise.all(
    toolCalls.map(async (call) => {
      const name = call.function.name;
      toolsUsed.add(name);

      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(call.function.arguments || "{}") as Record<
          string,
          unknown
        >;
      } catch {
        args = {};
      }

      emit(onProgress, {
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

      emit(onProgress, {
        type: "tool_done",
        case_id: caseId,
        round,
        tool: name,
        ok,
        error: errorMsg,
      });

      const toolMessage: ChatCompletionMessageParam = {
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(payload),
      };
      return toolMessage;
    })
  );
}

/**
 * Person A — bounded native tool-calling investigation loop.
 * Validate every Finding with FindingSchema before return.
 */
export async function runInvestigationAgent(
  caseRow: CaseSummary,
  onProgress?: InvestigationProgressHandler
): Promise<Finding> {
  const ctx = toAgentCaseContext(caseRow);
  const client = getLlmClient();
  const model = getChatModel();
  const tools = TOOL_DEFINITIONS as ChatCompletionTool[];
  const toolsUsed = new Set<string>();

  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: INVESTIGATOR_SYSTEM_PROMPT },
    { role: "user", content: buildInitialUserMessage(ctx) },
  ];

  let lastParseError: string | null = null;

  for (let round = 1; round <= MAX_LLM_ROUNDS; round++) {
    const isFinalRound = round === MAX_LLM_ROUNDS;
    const isFirstRound = round === 1;

    emit(onProgress, {
      type: "round_start",
      case_id: caseRow.id,
      round,
      max_rounds: MAX_LLM_ROUNDS,
      mode: isFinalRound ? "finalize" : "tools",
    });

    if (isFinalRound) {
      messages.push({
        role: "user",
        content: lastParseError
          ? `${FINALIZE_USER_PROMPT}\n\nPrevious JSON failed validation: ${lastParseError}\nReturn corrected Finding JSON only.`
          : FINALIZE_USER_PROMPT,
      });
    }

    const completion = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.1,
      ...(isFinalRound
        ? { response_format: { type: "json_object" as const } }
        : {
            tools,
            // Round 1 must gather ops/policy facts — never skip straight to a Finding.
            tool_choice: isFirstRound
              ? ("required" as const)
              : ("auto" as const),
          }),
    });

    const choice = completion.choices[0];
    const message = choice?.message;
    if (!message) {
      throw new AppError(
        502,
        "Investigation agent received an empty model response",
        "AGENT_EMPTY_RESPONSE"
      );
    }

    messages.push(message);

    const toolCalls = message.tool_calls;
    if (!isFinalRound && toolCalls && toolCalls.length > 0) {
      const toolMessages = await runToolCalls(
        toolCalls,
        toolsUsed,
        caseRow.id,
        round,
        onProgress
      );
      messages.push(...toolMessages);
      continue;
    }

    const content = message.content?.trim();
    if (!content) {
      if (isFinalRound) {
        throw new AppError(
          502,
          "Investigation agent did not return a Finding",
          "AGENT_NO_FINDING"
        );
      }
      messages.push({
        role: "user",
        content:
          "No tool calls received. Either call needed tools now, or prepare to finalize the Finding from evidence you already have.",
      });
      continue;
    }

    try {
      const finding = parseFinding(content, caseRow, [...toolsUsed]);
      emit(onProgress, {
        type: "finding_ready",
        case_id: caseRow.id,
        recommendation: finding.recommendation,
        tools_used: finding.tools_used ?? [...toolsUsed],
      });
      return finding;
    } catch (err) {
      lastParseError = err instanceof Error ? err.message : String(err);
      if (isFinalRound) {
        throw new AppError(
          502,
          `Investigation agent returned an invalid Finding: ${lastParseError}`,
          "AGENT_INVALID_FINDING"
        );
      }
      messages.push({
        role: "user",
        content: `Finding JSON was invalid (${lastParseError}). Gather any missing tools if needed, then return valid Finding JSON.`,
      });
    }
  }

  throw new AppError(
    502,
    "Investigation agent exhausted rounds without a valid Finding",
    "AGENT_EXHAUSTED"
  );
}
