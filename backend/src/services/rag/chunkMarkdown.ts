/**
 * Person C — heading-aware policy chunking (~400–800 tokens target).
 * Ops rows stay out of the vector index; this is for policy markdown only.
 */

export type PolicyChunkDraft = {
  doc_name: string;
  section: string | null;
  chunk_index: number;
  content: string;
};

/** ~4 chars/token heuristic; stay inside 400–800 token guidance. */
const TARGET_MIN_CHARS = 1600;
const TARGET_MAX_CHARS = 3200;

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Split oversized text on blank lines, then hard-split if needed. */
function splitLongBlock(text: string, maxChars: number): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return [trimmed];

  const paragraphs = trimmed.split(/\n{2,}/);
  const parts: string[] = [];
  let buf = "";

  for (const p of paragraphs) {
    const candidate = buf ? `${buf}\n\n${p}` : p;
    if (candidate.length <= maxChars) {
      buf = candidate;
      continue;
    }
    if (buf) parts.push(buf);
    if (p.length <= maxChars) {
      buf = p;
    } else {
      for (let i = 0; i < p.length; i += maxChars) {
        parts.push(p.slice(i, i + maxChars).trim());
      }
      buf = "";
    }
  }
  if (buf) parts.push(buf);
  return parts.filter(Boolean);
}

/**
 * Chunk one policy file by `##` / `###` headings; keep section labels for citations.
 */
export function chunkMarkdown(
  docName: string,
  markdown: string
): PolicyChunkDraft[] {
  const normalized = markdown.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const h2Parts = normalized.split(/(?=^## )/m).map((s) => s.trim()).filter(Boolean);
  const rawBlocks: Array<{ section: string | null; body: string }> = [];

  for (const part of h2Parts) {
    const h2Match = part.match(/^##\s+(.+?)(?:\n|$)/);
    const h2Title = h2Match?.[1]?.trim() ?? null;

    if (part.length <= TARGET_MAX_CHARS) {
      rawBlocks.push({ section: h2Title, body: part });
      continue;
    }

    const h3Parts = part.split(/(?=^### )/m).map((s) => s.trim()).filter(Boolean);
    if (h3Parts.length <= 1) {
      for (const piece of splitLongBlock(part, TARGET_MAX_CHARS)) {
        rawBlocks.push({ section: h2Title, body: piece });
      }
      continue;
    }

    for (const h3 of h3Parts) {
      const h3Match = h3.match(/^###\s+(.+?)(?:\n|$)/);
      const section =
        h2Title && h3Match
          ? `${h2Title} › ${h3Match[1].trim()}`
          : h3Match?.[1]?.trim() ?? h2Title;

      if (h3.length <= TARGET_MAX_CHARS) {
        rawBlocks.push({ section, body: h3 });
      } else {
        for (const piece of splitLongBlock(h3, TARGET_MAX_CHARS)) {
          rawBlocks.push({ section, body: piece });
        }
      }
    }
  }

  // Merge tiny adjacent blocks under the same section when possible.
  const merged: Array<{ section: string | null; body: string }> = [];
  for (const block of rawBlocks) {
    const prev = merged[merged.length - 1];
    if (
      prev &&
      prev.section === block.section &&
      prev.body.length < TARGET_MIN_CHARS &&
      prev.body.length + block.body.length + 2 <= TARGET_MAX_CHARS
    ) {
      prev.body = `${prev.body}\n\n${block.body}`;
    } else {
      merged.push({ ...block });
    }
  }

  return merged.map((block, chunk_index) => ({
    doc_name: docName,
    section: block.section,
    chunk_index,
    content: block.body.trim(),
  }));
}

export function summarizeChunks(chunks: PolicyChunkDraft[]) {
  return {
    count: chunks.length,
    avg_estimated_tokens: chunks.length
      ? Math.round(
          chunks.reduce((sum, c) => sum + estimateTokens(c.content), 0) /
            chunks.length
        )
      : 0,
  };
}
