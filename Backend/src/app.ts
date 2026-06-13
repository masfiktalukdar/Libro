import express from "express";
import helmet from "helmet";
import { globalErrorHandler } from "@utils/globalErrorHandler.js";

// All the route imports
import { authRouter } from "@modules/auth/auth.route.js";

const app = express();

app.use(helmet());
app.use(express.json());

// Routes Initialization
app.use("/users", authRouter);

// Global Erorr Handler
app.use(globalErrorHandler);

export default app;
