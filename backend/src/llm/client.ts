import OpenAI from "openai";
import { env } from "../config/env.js";
import { AppError } from "../middleware/errorHandler.js";

/** OpenAI-compatible client (native tool calling; no LangGraph). */
let client: OpenAI | null = null;

export function getLlmClient() {
  if (!env.openaiApiKey) {
    throw new AppError(
      500,
      "OPENAI_API_KEY is not configured",
      "MISSING_OPENAI_KEY"
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}

export function getChatModel() {
  return env.chatModel;
}
