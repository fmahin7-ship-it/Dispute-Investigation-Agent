import OpenAI from "openai";
import { env } from "../config/env.js";

/** Person A — OpenAI-compatible client (same idea as UddoktaHut openai SDK). */
let client: OpenAI | null = null;

export function getLlmClient() {
  if (!env.openaiApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }
  return client;
}

export function getChatModel() {
  return env.chatModel;
}
