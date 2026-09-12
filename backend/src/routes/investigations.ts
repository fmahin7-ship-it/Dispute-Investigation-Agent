import { Router } from "express";
import {
  createInvestigation,
  streamInvestigation,
  decideInvestigation,
  briefInvestigation,
  getInvestigation,
} from "../controllers/investigationsController.js";
import { validate } from "../middleware/validate.js";
import {
  CaseIdParamSchema,
  InvestigationIdParamSchema,
} from "../schemas/cases.js";
import { DecideBodySchema } from "../schemas/requests.js";

export const investigationsRouter = Router();

investigationsRouter.post(
  "/:caseId/stream",
  validate(CaseIdParamSchema, "params"),
  streamInvestigation
);

investigationsRouter.post(
  "/:caseId",
  validate(CaseIdParamSchema, "params"),
  createInvestigation
);

investigationsRouter.get(
  "/:investigationId/status",
  validate(InvestigationIdParamSchema, "params"),
  getInvestigation
);

investigationsRouter.post(
  "/:investigationId/decision",
  validate(InvestigationIdParamSchema, "params"),
  validate(DecideBodySchema, "body"),
  decideInvestigation
);

investigationsRouter.post(
  "/:investigationId/brief",
  validate(InvestigationIdParamSchema, "params"),
  briefInvestigation
);
