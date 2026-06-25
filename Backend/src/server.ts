import app from "@/app.js";
import dotenv from "dotenv";
import { verifyDatabaseConnection } from "@config/dbConnect.js";
import { nodemailerVerify } from "@config/nodemailerConnect.js";

dotenv.config();

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`server is starting on port ${port}`);

  (async () => {
    try {
      await verifyDatabaseConnection();
      await nodemailerVerify();
    } catch (err) {
      console.error("Database connection error", err);
      process.exit(1);
    }
  })();
});
