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
  if (!req.body) {
    return res.status(400).json({ error: "Required field is missing" });
  }

  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Required field is missing" });
  }

  const fromAddress = process.env.SMTP_FROM_EMAIL || "support.libro@gmail.com";

  if (!fromAddress) {
    return res.status(500).json({
      error: "SMTP sender address is not configured",
    });
  }

  const emailOptions = {
    from: `"Libro Team" <${fromAddress}>`,
    to: to,
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
      return res.status(502).json({
        error:
          "Brevo accepted the request but did not accept the message for delivery",
        accepted: deliveryResult.accepted,
        rejected: deliveryResult.rejected,
        messageId: deliveryResult.messageId,
      });
    }

    return res.status(200).json({
      message: "Email send successfully",
      accepted: deliveryResult.accepted,
      rejected: deliveryResult.rejected,
      messageId: deliveryResult.messageId,
    });
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
      console.warn("Email sending daily limit exceeded...");
    }
    console.error("Failed to send email:", err);
    throw new AppError("Internal Server Error While Sending Emails", 500);
  }
};
