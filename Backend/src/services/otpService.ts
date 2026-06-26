import { Request, Response } from "express";
import crypto from "crypto";
import { executeTransaction } from "@config/dbConnect.js";
import { sendEmailUtility } from "@services/emailService.js";
import { userSignUpOTPTemplate } from "@templates/userSignUpOTP.js";
import { AppError } from "@utils/appError.js";

// Generate the otp
function generateOTP(): string {
  const num = crypto.randomInt(100000, 900000);
  return num.toString();
}

class OTPHandler {
  // sending the OTP
  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      if (!req.body) {
        throw new AppError("Please enter your email", 400);
      }
      const { email } = req.body;
      if (!email || email === undefined) {
        throw new AppError("Please enter your email", 400);
      }

      const otpId = crypto.randomUUID();

      // otp is generating here
      const otp = generateOTP();

      // otp expiery date is generating here
      const OTP_EXPIRY_HOURS = 24;
      const otpExpiery = new Date(
        Date.now() + OTP_EXPIRY_HOURS * 60 * 60 * 1000,
      )
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      return executeTransaction(async (trxConnection) => {
        // delete all the otp that are releted to this
        const deleteOTPSQL = `DELETE FROM user_otps WHERE email = ?`;
        await trxConnection.execute(deleteOTPSQL, [email]);

        // now insert the otp value in the table
        const insertOTPSQL = `INSERT INTO user_otps (otp_id, email, otp, expires_at) VALUES (?,?,?,?)`;
        await trxConnection.execute(insertOTPSQL, [
          otpId,
          email,
          otp,
          otpExpiery,
        ]);

        // HTML content
        const emailHTMLContent = userSignUpOTPTemplate(otp);

        // email will be send from here
        await sendEmailUtility({
          email: email,
          subject: "Your Libro Security Verification Code",
          html: emailHTMLContent,
        });

        res.status(201).json({
          success: true,
          message: `OTP has been send to ${email}. Please check your inbox`,
        });
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Verifying the OTP
}

export const otpHandler = new OTPHandler();
