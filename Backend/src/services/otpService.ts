import crypto from "crypto";
import { executeTransaction } from "@config/dbConnect.js";
import { sendEmailUtility } from "@services/emailService.js";
import { AppError } from "@utils/appError.js";

// OTP purpose is defined here
export enum OTP_PURPOSE {
  registration_request = "REGISTRATION_REQUEST",
}

// OTP subjects are defiend here
export enum OTP_SUBJECTS {
  registration_request = "Libro: Verify email for Institution Registration",
}

// Generate the otp
function generateOTP(): string {
  const num = crypto.randomInt(100000, 900000);
  return num.toString();
}

class OTPService {
  // sending the OTP
  async sendOTP(
    email: string,
    emailSubject: string,
    purpose: OTP_PURPOSE,
    htmlTemplate: (otp: string) => string,
  ): Promise<void> {
    try {
      if (!email) {
        throw new AppError("Please enter your email", 400);
      }

      // Generating otpId
      const otpId = crypto.randomUUID();

      // actual OTP is generating here
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
        const deleteOTPSQL = `DELETE FROM user_otps WHERE email = ? AND purpose = ?`;
        await trxConnection.execute(deleteOTPSQL, [email, purpose]);

        // now insert the otp value in the table
        const insertOTPSQL = `INSERT INTO user_otps (otp_id, email, otp, purpose, expires_at) VALUES (?,?,?,?,?)`;
        await trxConnection.execute(insertOTPSQL, [
          otpId,
          email,
          otp,
          purpose,
          otpExpiery,
        ]);

        // HTML content
        const emailHTMLContent = htmlTemplate(otp);

        // email will be send from here
        await sendEmailUtility({
          email: email,
          subject: emailSubject,
          html: emailHTMLContent,
        });
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }
}

export const otpService = new OTPService();
