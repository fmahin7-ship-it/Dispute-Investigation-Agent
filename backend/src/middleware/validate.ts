import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "./errorHandler.js";

type RequestSlot = "body" | "params" | "query";

/**
 * Zod request validation middleware.
 * Controllers stay thin — invalid input never reaches services.
 */
export function validate(schema: ZodSchema, slot: RequestSlot = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[slot]);
    if (!parsed.success) {
      return next(
        new AppError(400, "Validation failed", "VALIDATION_ERROR", {
          issues: parsed.error.flatten(),
        })
      );
    }
    (req as Request & { validated: unknown }).validated = parsed.data;
    // merge parsed defaults back onto the slot
    Object.assign(req[slot], parsed.data);
    next();
  };
}
