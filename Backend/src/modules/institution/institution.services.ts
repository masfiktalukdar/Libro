import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { executeTransaction } from "@config/dbConnect.js";
import { institutionRepository } from "@modules/institution/institution.repository.js";
import {
  InstitutionEntity,
  InstitutionRegistrationRequstEntity,
} from "@modules/institution/institution.interface.js";
import {
  InstitutionRegistrationInput,
  InstitutionCreationInput,
} from "@modules/institution/institution.validator.js";
import checkRequiredFields from "@utils/checkRequiredFields.js";
import { createUniqueSlugForInstitution } from "@utils/createUniqueSlug.js";
import { AppError } from "@/utils/appError.js";

export class InstitutionServices {
  // Creating the registration request
  async createInstitutionRegistrationRequest(
    payload: InstitutionRegistrationInput,
  ): Promise<{
    institutionRequestId: string;
    success: boolean;
  }> {
    // Throw error if there is no request body
    if (!payload) {
      throw new AppError("Request body is required", 400);
    }
    const requiredFields = [
      "institution_name",
      "institution_email",
      "institution_founding_year",
      "institution_eiin_number",
      "institution_location",
      "institution_type",
      "institution_location",
    ];
    checkRequiredFields(requiredFields, payload);

    const alredayAppliedInstitutions =
      await institutionRepository.findInstitutionRequstByEmail(
        payload.institution_email,
      );
    if (alredayAppliedInstitutions) {
      throw new AppError(
        "Registration request already has been sent with this email",
        400,
      );
    }
    return await executeTransaction(async (trxConnection) => {
      try {
        const generatedInstitutionRequestId = crypto.randomUUID();

        const institutionRegistrationRequstEntity: InstitutionRegistrationRequstEntity =
          {
            institution_request_id: generatedInstitutionRequestId,
            institution_name: payload.institution_name,
            institution_logo_url: payload.institution_logo_url || null,
            institution_email: payload.institution_email,
            institution_founding_year: payload.institution_founding_year,
            institution_eiin_number: payload.institution_eiin_number,
            institution_location: payload.institution_location,
            registration_request_status: "pending",
            institution_type: payload.institution_type,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
          };

        await institutionRepository.createInstitutionRegistrationRequest(
          institutionRegistrationRequstEntity,
          trxConnection,
        );

        return {
          institutionRequestId: generatedInstitutionRequestId,
          success: true,
        };
      } catch (err) {
        if (err instanceof AppError) {
          throw err;
        }
        throw new AppError(`Unexpected db error: ${err}`, 500);
      }
    });
  }

  // Editing the registration request
  async editRegistrationRequest(
    institutionRequestIdPayload: string,
    statusPayload: string,
  ): Promise<{
    success: boolean;
    message: string;
    institutionRequestId: string;
  }> {
    return await executeTransaction(async (trxConnection) => {
      try {
        await institutionRepository.editInstitutionRegistrationRequest(
          institutionRequestIdPayload,
          statusPayload,
          trxConnection,
        );
        return {
          success: true,
          message: `Institution request is changed to ${statusPayload} successfully`,
          institutionRequestId: institutionRequestIdPayload,
        };
      } catch (err) {
        if (err instanceof AppError) {
          throw err;
        }
        throw new AppError(`Unexpected error occoured ${err}`, 500);
      }
    });
  }

  // Send invitation link to create
  async sendInstitutionCreationInvitation(requestId: string): Promise<string> {
    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      if (JWT_SECRET === undefined)
        throw new AppError("JWT SECRET shouldn't be undefined", 400);

      const institutionRegistrationRequest =
        await institutionRepository.findInstitutionRegistrationRequest(
          requestId,
        );
      const {
        institution_email,
        institution_eiin_number,
        registration_request_status,
      } = institutionRegistrationRequest;

      if (
        !institutionRegistrationRequest ||
        institutionRegistrationRequest === null
      ) {
        throw new AppError("No request found by this id", 400);
      }

      if (registration_request_status !== "approved") {
        throw new AppError(
          "This institution creation request is not approved",
          400,
        );
      }

      // creating payload for jwt
      const jwtPayload = {
        requestId,
        institutionEmail: institution_email,
        institutionEiinNumber: institution_eiin_number,
      };

      const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "24h" });

      const registrationURL = `libro.com/institution-registration?id=${requestId}&token=${token}`;
      return registrationURL;
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured ${err}`, 400);
    }
  }

  // * Create new institution
  async createNewInstitution(
    institutionRequestId: string,
    payload: InstitutionCreationInput,
  ): Promise<{
    success: boolean;
    message: string;
    data: Omit<InstitutionEntity, "institution_password_hashed">;
  }> {
    try {
      // Checking the input paylaod data
      if (!payload || payload === undefined) {
        throw new AppError("Request body is required", 400);
      }
      if (!institutionRequestId || institutionRequestId === undefined) {
        throw new AppError("Institution Request id is required", 400);
      }

      return executeTransaction(async (trxConnection) => {
        // Getting the required data from the previous requst id
        const institutionRegistrationRequest =
          await institutionRepository.findInstitutionRegistrationRequest(
            institutionRequestId,
          );
        const {
          institution_name,
          institution_email,
          institution_logo_url,
          institution_founding_year,
          institution_eiin_number,
          institution_location,
          institution_type,
          registration_request_status,
        } = institutionRegistrationRequest;

        if (
          !institutionRegistrationRequest ||
          institutionRegistrationRequest === null
        ) {
          throw new AppError("No request found by this id", 400);
        }

        if (registration_request_status !== "approved") {
          throw new AppError(
            "This institution creation request is not approved",
            400,
          );
        }

        // check if any institution already exists with the same email or eiin number
        const isInstitutionExists =
          await institutionRepository.isInstitutionExists(
            institution_email,
            institution_eiin_number,
            trxConnection,
          );
        if (isInstitutionExists) {
          throw new AppError(
            "Error: Another institution exists with the same email or eiin number",
            400,
          );
        }

        // Creating actual id for the institute
        const generatedInstitutionId = crypto.randomUUID();
        // Creating unique slug
        const uniqueSlug = await createUniqueSlugForInstitution(
          institution_name,
          generatedInstitutionId,
        );

        //creating password hashed
        const plainPassword = payload.institution_password_text;
        if (plainPassword === undefined || plainPassword === null) {
          throw new AppError("Password field cannot be undefined", 400);
        }
        const hashedPassword = await bcrypt.hash(plainPassword, 12);

        // Checking the required fields
        const requiredFields = [
          "institution_short_form",
          "membership_fee_type",
          "membership_fee_amount",
          "student_book_borrow_limit",
          "student_fine_limit_amount",
          "reservation_expiry_in_minutes",
          "library_opening_time",
          "library_closing_time",
        ];
        checkRequiredFields(requiredFields, payload);

        // Creating full institution object
        const institutionCreationEntity: InstitutionEntity = {
          institution_id: generatedInstitutionId,
          institution_name: institution_name,
          institution_short_form: payload.institution_short_form,
          institution_slug: uniqueSlug,
          institution_logo_url:
            payload.institution_logo_url || institution_logo_url || "",
          institution_email: institution_email,
          institution_password_hashed: hashedPassword,
          institution_founding_year: institution_founding_year,
          institution_eiin_number: institution_eiin_number,
          institution_location: institution_location,
          institution_type: institution_type,
          student_approval_system: payload.student_approval_system,
          membership_fee_type: payload.membership_fee_type,
          membership_fee_amount: payload.membership_fee_amount,
          student_book_borrow_limit: payload.student_book_borrow_limit,
          student_fine_limit_amount: payload.student_fine_limit_amount,
          reservation_expiry_in_minutes: payload.reservation_expiry_in_minutes,
          library_opening_time: payload.library_opening_time,
          library_closing_time: payload.library_closing_time,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        };

        await institutionRepository.createNewInstitution(
          institutionCreationEntity,
          trxConnection,
        );

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { institution_password_hashed, ...institutionCreationResult } =
          institutionCreationEntity;
        return {
          success: true,
          message: `${institution_name} has been created successfully`,
          data: institutionCreationResult,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // ! From here, institution edit work will begin
}

export const institutionServices = new InstitutionServices();
