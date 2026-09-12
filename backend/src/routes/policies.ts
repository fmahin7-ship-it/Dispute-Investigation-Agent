import { Router } from "express";
import {
  getPolicyHandler,
  listPoliciesHandler,
} from "../controllers/policiesController.js";

export const policiesRouter = Router();

policiesRouter.get("/", listPoliciesHandler);
policiesRouter.get("/:docName", getPolicyHandler);
