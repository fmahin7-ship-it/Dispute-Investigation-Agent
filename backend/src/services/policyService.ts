import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { AppError } from "../middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POLICIES_DIR = path.resolve(__dirname, "../../data/policies");

const DOC_META: Record<string, { title: string; summary: string }> = {
  "HighValueRules.md": {
    title: "High-Value Order & Manual Verification",
    summary:
      "When orders above $500 with delivery evidence require human verification before refund.",
  },
  "RefundPolicy.md": {
    title: "Customer Refund & Returns",
    summary:
      "Refund windows, duplicate charges, wrong-item handling, and investigator obligations.",
  },
  "DeliveryDisputePolicy.md": {
    title: "Delivery Dispute & Evidence",
    summary:
      "How tracking, GPS bands, and delivery photo metadata are weighed in INR claims.",
  },
  "FraudEscalationPolicy.md": {
    title: "Fraud Indicators & Escalation",
    summary:
      "Risk flags, scoring guidance, and when to HOLD or escalate instead of auto-refund.",
  },
};

function assertSafeDocName(docName: string) {
  if (
    docName.includes("..") ||
    docName.includes("/") ||
    docName.includes("\\") ||
    !docName.toLowerCase().endsWith(".md")
  ) {
    throw new AppError(400, "Invalid policy document name", "BAD_POLICY_NAME");
  }
}

export async function listPolicies() {
  const entries = await fs.readdir(POLICIES_DIR);
  const docs = entries
    .filter((name) => name.toLowerCase().endsWith(".md"))
    .sort()
    .map((doc) => ({
      doc,
      title: DOC_META[doc]?.title ?? doc.replace(/\.md$/i, ""),
      summary: DOC_META[doc]?.summary ?? "NovaCart policy document",
    }));
  return { policies: docs };
}

export async function getPolicyByDocName(docName: string) {
  assertSafeDocName(docName);
  const fullPath = path.join(POLICIES_DIR, docName);
  try {
    const content = await fs.readFile(fullPath, "utf8");
    return {
      doc: docName,
      title: DOC_META[docName]?.title ?? docName.replace(/\.md$/i, ""),
      content,
    };
  } catch {
    throw new AppError(404, `Policy ${docName} not found`, "POLICY_NOT_FOUND");
  }
}
