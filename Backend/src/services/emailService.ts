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

// interface from Email Payload
interface EmailPayload {
  email: string;
  subject: string;
  text?: string;
  html?: string;
}

// Function for seding email
export const sendEmailUtility = async (payload: EmailPayload) => {
  const { email, subject, text, html } = payload;

  if (!email || !subject || (!text && !html)) {
    throw new AppError("Required field is missing", 400);
  }

  const fromAddress = process.env.SMTP_FROM_EMAIL || "support.libro@gmail.com";

  if (!fromAddress) {
    throw new AppError("SMTP sender address is not configured", 500);
  }

  const emailOptions = {
    from: `"Libro Team" <${fromAddress}>`,
    to: email,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    const deliveryResult = await transporter.sendMail(emailOptions);

    if (
      (deliveryResult.rejected && deliveryResult.rejected.length > 0) ||
      (deliveryResult.accepted && deliveryResult.accepted.length === 0)
    ) {
      throw new AppError(
        "Email provider accepted request but rejected message delivery",
        502,
      );
    }

    return deliveryResult;
  } catch (err: unknown) {
    const error = err as {
      message?: string;
      responseCode?: number;
    };

    const errorMessage = (error.message || "").toLowerCase();
    const isLimitExceeded =
      errorMessage.includes("429") ||
      errorMessage.includes("limit exceeded") ||
      error.responseCode === 429;

    if (isLimitExceeded) {
      console.warn("API email sending daily limit exceeded!");
      throw new AppError(
        "Email daily service quota exceeded. Please try again later.",
        429,
      );
    }

    console.error("Failed to send email:", err);
    throw new AppError("Internal Server Error While Sending Emails", 500);
  }
};
