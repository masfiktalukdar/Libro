import express from "express";
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

// Global Erorr Handler
app.use(globalErrorHandler);

export default app;
