import type { Request, Response, NextFunction } from "express";
import { DecideBodySchema } from "../schemas/requests.js";
import {
  runInvestigation,
  getInvestigationOrThrow,
} from "../services/investigationService.js";
import { applyDecision } from "../services/decisionService.js";
import { createBriefing } from "../services/briefingService.js";

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
