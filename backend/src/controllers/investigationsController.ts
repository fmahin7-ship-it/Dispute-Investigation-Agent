import type { Request, Response, NextFunction } from "express";
import { DecideBodySchema } from "../schemas/requests.js";
import {
  runInvestigation,
  getInvestigationOrThrow,
} from "../services/investigationService.js";
import { applyDecision } from "../services/decisionService.js";
import { createBriefing } from "../services/briefingService.js";
import { AppError } from "../middleware/errorHandler.js";

function writeSse(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function createInvestigation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await runInvestigation(req.params.caseId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/** Live tool/round progress via SSE; final event is `complete` with investigation record. */
export async function streamInvestigation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    writeSse(res, "progress", {
      type: "started",
      case_id: req.params.caseId,
    });

    const result = await runInvestigation(req.params.caseId, (event) => {
      writeSse(res, "progress", event);
    });

    writeSse(res, "complete", result);
    res.end();
  } catch (err) {
    if (res.headersSent) {
      const message =
        err instanceof AppError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Investigation failed";
      writeSse(res, "error", { message });
      res.end();
      return;
    }
    next(err);
  }
}

export async function getInvestigation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getInvestigationOrThrow(req.params.investigationId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function decideInvestigation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = DecideBodySchema.parse(req.body);
    const result = await applyDecision(
      req.params.investigationId,
      body.decision,
      body.decided_by
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function briefInvestigation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await createBriefing(req.params.investigationId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
