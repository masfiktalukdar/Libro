import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { globalErrorHandler } from "@utils/globalErrorHandler.js";

// All the route imports
import { authRouter } from "@modules/auth/auth.route.js";
import { institutionRouter } from "@modules/institution/institution.route.js";
import { setupSwagger } from "@/docs/swagger.js";

const app = express();

const isDevelopment = process.env.NODE_ENV === "development";

// In production, enforce default strict CSP; in development, relax CSP for Swagger UI
app.use(
  helmet({
    contentSecurityPolicy: isDevelopment ? false : undefined,
  }),
);
app.use(express.json());

// Swagger Documentation (only mounted in development at /api/v1/docs)
setupSwagger(app);

// Routes Initialization
app.use("/api/v1/users", authRouter);
app.use("/api/v1/institution", institutionRouter);

// Handleing with not found routes

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `The requested path '${req.originalUrl}' does not exist on this server.`,
  });
});

// Global Erorr Handler
app.use(globalErrorHandler);

export default app;
