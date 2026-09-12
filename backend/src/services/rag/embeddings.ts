import { getLlmClient } from "../../llm/client.js";
import { env } from "../../config/env.js";

const EMBED_BATCH_SIZE = 64;

/** pgvector accepts a float array literal string. */
export function toVectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

/**
 * Embed one or more texts with AI_EMBEDDING_MODEL (default text-embedding-3-small → 1536).
 * Batches to keep OpenAI payload size reasonable.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const client = getLlmClient();
  const model = env.embeddingModel;
  const out: number[][] = new Array(texts.length);

  for (let i = 0; i < texts.length; i += EMBED_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBED_BATCH_SIZE);
    const response = await client.embeddings.create({
      model,
      input: batch,
    });

    const sorted = [...response.data].sort((a, b) => a.index - b.index);
    for (let j = 0; j < sorted.length; j++) {
      const row = sorted[j];
      if (!row?.embedding?.length) {
        throw new Error(`Empty embedding at batch offset ${i + j}`);
      }
      out[i + j] = row.embedding;
    }
  }

  return out;
}

export async function embedQuery(query: string): Promise<number[]> {
  const [vector] = await embedTexts([query]);
  if (!vector) {
    throw new Error("Failed to embed query");
  }
  return vector;
}
