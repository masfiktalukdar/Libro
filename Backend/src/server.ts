import app from "@/app.js";
import dotenv from "dotenv";
import { verifyDatabaseConnection } from "@config/dbConnect.js";

// All the route imports
import { authRouter } from "@modules/auth/auth.route.js";

dotenv.config();

const port = process.env.PORT || 8000;

// All the Routes here
app.use("/users", authRouter);

app.listen(port, () => {
  console.log(`server is starting on port ${port}`);

  (async () => {
    try {
      await verifyDatabaseConnection();
    } catch (err) {
      console.error("Database connection error", err);
      process.exit(1);
    }
  })();
});
