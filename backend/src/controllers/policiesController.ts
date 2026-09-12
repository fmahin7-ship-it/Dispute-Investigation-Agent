import type { Request, Response, NextFunction } from "express";
import { getPolicyByDocName, listPolicies } from "../services/policyService.js";

export async function listPoliciesHandler(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await listPolicies());
  } catch (err) {
    next(err);
  }
}

export async function getPolicyHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    res.json(await getPolicyByDocName(req.params.docName));
  } catch (err) {
    next(err);
  }
}
