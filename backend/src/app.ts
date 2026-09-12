import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestId } from "./middleware/requestId.js";
import { healthRouter } from "./routes/health.js";
import { casesRouter } from "./routes/cases.js";
import { investigationsRouter } from "./routes/investigations.js";
import { policiesRouter } from "./routes/policies.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigin.split(",").map((s) => s.trim()),
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(requestId);

  app.use("/health", healthRouter);
  app.use("/api/cases", casesRouter);
  app.use("/api/investigations", investigationsRouter);
  app.use("/api/policies", policiesRouter);

  app.use(errorHandler);
  return app;
}
