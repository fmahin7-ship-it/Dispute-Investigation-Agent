import { Router } from "express";
import { listCasesHandler, getCaseHandler } from "../controllers/casesController.js";
import { validate } from "../middleware/validate.js";
import { CaseIdParamSchema } from "../schemas/cases.js";

export const casesRouter = Router();

casesRouter.get("/", listCasesHandler);
casesRouter.get(
  "/:caseId",
  validate(CaseIdParamSchema, "params"),
  getCaseHandler
);
