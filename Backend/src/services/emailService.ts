import { Request, Response } from "express";
import env from "dotenv";
import { rateLimit } from "express-rate-limit";
import { transporter } from "@config/nodemailerConnect.js";
import { AppError } from "@utils/appError.js";

env.config();

// Setting up email rate limiting for express
export const emailRateLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  message: {
    error: "Too many emails sent from this IP. Please try again tomorrow.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Function for seding email
export const emailSender = async (req: Request, res: Response) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    res.status(400).json({ error: "Required field is missing" });
  }

  const emailOptions = {
    from: `"Libro Team" <${process.env.SMTP_USER_EMAIL}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    await transporter.sendMail(emailOptions);
    res.status(200).json({ message: "Email send successfully" });
  } catch (err: any) {
    const isLimitExceeded =
      err.message.includes("429") ||
      err.message.toLowerCase().includes("limit exceeded") ||
      err.responseCode === 429;

    if (isLimitExceeded) {
      console.warn("Email sending daily limit exceeded...");
    }
    console.error("Failed to send email:", err);
    throw new AppError("Internal Server Error While Sending Emails", 500);
  }
};
