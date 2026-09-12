import type { Request, Response, NextFunction } from "express";
import { listCases, getCaseById } from "../services/caseService.js";

export async function listCasesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const cases = await listCases();
    res.json({ cases });
  } catch (err) {
    next(err);
  }
}

export async function getCaseHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const caseRow = await getCaseById(req.params.caseId);
    res.json({ case: caseRow });
  } catch (err) {
    next(err);
  }
}
