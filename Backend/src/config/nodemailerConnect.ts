import nodemailer from "nodemailer";
import env from "dotenv";

env.config();

// Creating email transport
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "🤔",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER_EMAIL || "🤔",
    pass: process.env.SMTP_KEY || "🤔",
  },
});

export const nodemailerVerify = async () => {
  transporter.verify((error) => {
    if (error) {
      console.log(`SMTP Error: ${error}`);
    } else {
      console.log("SMTP connected successfully");
    }
  });
};
