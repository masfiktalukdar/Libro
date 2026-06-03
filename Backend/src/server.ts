import app from "@/app.js";
import dotenv from "dotenv";
import { connectDB } from "@config/dbConnect.js";

dotenv.config();

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server is starting on port ${port}`);

  (async () => {
    try {
      await connectDB();
      console.log("Database connected successfully");
    } catch (err) {
      console.error("Database connection error", err);
      process.exit(1);
    }
  })();
});