import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions.js";
import type { Finding } from "../../schemas/finding.js";
import type { CaseSummary } from "../../schemas/cases.js";
import { getChatModel, getLlmClient } from "../../llm/client.js";
import { AppError } from "../../middleware/errorHandler.js";
import { TOOL_DEFINITIONS } from "./toolDefinitions.js";
import {
  FINALIZE_USER_PROMPT,
  INVESTIGATOR_SYSTEM_PROMPT,
} from "./prompts.js";
import {
  emitProgress,
  type InvestigationProgressHandler,
} from "./progress.js";
import {
  buildInitialUserMessage,
  toAgentCaseContext,
} from "./caseContext.js";
import { parseFinding } from "./findingParse.js";
import { applyFindingGuards } from "./findingGuards.js";
import { runToolCalls } from "./toolRunner.js";

/** Architecture: bounded native tool loop — max 3 LLM rounds (no LangGraph). */
const MAX_LLM_ROUNDS = 3;

function buildFinalizeUserContent(lastParseError: string | null): string {
  if (!lastParseError) return FINALIZE_USER_PROMPT;
  return `${FINALIZE_USER_PROMPT}\n\nPrevious JSON failed validation: ${lastParseError}\nReturn corrected Finding JSON only.`;
}

function emptyToolNudgeMessage(): ChatCompletionMessageParam {
  return {
    role: "user",
    content:
      "No tool calls received. Either call needed tools now, or prepare to finalize the Finding from evidence you already have.",
  };
}

function invalidFindingNudgeMessage(error: string): ChatCompletionMessageParam {
  return {
    role: "user",
    content: `Finding JSON was invalid (${error}). Gather any missing tools if needed, then return valid Finding JSON.`,
  };
}

async function requestModelTurn(options: {
  messages: ChatCompletionMessageParam[];
  isFinalRound: boolean;
  isFirstRound: boolean;
  tools: ChatCompletionTool[];
}) {
  const client = getLlmClient();
  const model = getChatModel();
  const { messages, isFinalRound, isFirstRound, tools } = options;

  return client.chat.completions.create({
    model,
    messages,
    temperature: 0.1,
    ...(isFinalRound
      ? { response_format: { type: "json_object" as const } }
      : {
          tools,
          // Round 1 must gather ops/policy facts — never skip straight to a Finding.
          tool_choice: isFirstRound ? ("required" as const) : ("auto" as const),
        }),
  });
}

/**
 * Bounded native tool-calling investigation loop.
 * Orchestrates rounds only; parsing / tools / prompts live in sibling modules.
 */
export async function runInvestigationAgent(
  caseRow: CaseSummary,
  onProgress?: InvestigationProgressHandler
): Promise<Finding> {
  const ctx = toAgentCaseContext(caseRow);
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

    emitProgress(onProgress, {
      type: "round_start",
      case_id: caseRow.id,
      round,
      max_rounds: MAX_LLM_ROUNDS,
      mode: isFinalRound ? "finalize" : "tools",
    });

    if (isFinalRound) {
      messages.push({
        role: "user",
        content: buildFinalizeUserContent(lastParseError),
      });
    }

    const completion = await requestModelTurn({
      messages,
      isFinalRound,
      isFirstRound,
      tools,
    });

    const message = completion.choices[0]?.message;
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
      messages.push(emptyToolNudgeMessage());
      continue;
    }

    try {
      const parsed = parseFinding(content, caseRow, [...toolsUsed]);
      const finding = await applyFindingGuards(parsed, caseRow);
      emitProgress(onProgress, {
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
      messages.push(invalidFindingNudgeMessage(lastParseError));
    }
  }

  throw new AppError(
    502,
    "Investigation agent exhausted rounds without a valid Finding",
    "AGENT_EXHAUSTED"
  );
}
