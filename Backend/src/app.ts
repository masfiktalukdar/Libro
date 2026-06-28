import express, { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { globalErrorHandler } from "@utils/globalErrorHandler.js";

// All the route imports
import { authRouter } from "@modules/auth/auth.route.js";
import { institutionRouter } from "@modules/institution/institution.route.js";

const app = express();

app.use(helmet());
app.use(express.json());

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
