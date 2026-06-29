import bcrypt from "bcrypt";
import { executeTransaction } from "@config/dbConnect.js";
import { institutionRepository } from "@modules/institution/institution.repository.js";
import { InstitutionEntity } from "@modules/institution/institution.interface.js";
import { AppError } from "@/utils/appError.js";
import { createInstitutionSlug } from "@/utils/createUniqueSlug.js";

// Identify the fields
const PROFILE_FIELDS = [
  "institution_short_form",
  "institution_logo_url",
  "institution_founding_year",
  "institution_location",
];

const SETTINGS_FIELDS = [
  "student_approval_system",
  "membership_fee_type",
  "membership_fee_amount",
  "student_book_borrow_limit",
  "student_fine_limit_amount",
  "reservation_expiry_in_minutes",
  "library_opening_time",
  "library_closing_time",
];

// Starting the actual code

class EditInstitutionService {
  // * Edit institution name
  async editInstitutionName(
    payload: Partial<InstitutionEntity>,
  ): Promise<void> {
    try {
      const newInstitutionName = payload.institution_name;
      const institutionId = payload.institution_id;

      if (!newInstitutionName || !institutionId) {
        throw new AppError("Please enter new institution name properly", 400);
      }
      const newInstitutionSlug = await createInstitutionSlug(
        newInstitutionName,
        institutionId,
      );
      return executeTransaction(async (trxConnection) => {
        await institutionRepository.updateInstitutionName(
          newInstitutionName,
          institutionId,
          newInstitutionSlug,
          trxConnection,
        );
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Editing general fields of an institution

  async editInstitutionGeneralFields(
    institutionId: string,
    payload: Partial<InstitutionEntity>,
  ) {
    if (!payload || Object.keys(payload).length === 0) {
      throw new AppError("Please enter required fields", 500);
    }

    const incomingFields = Object.keys(payload);
    const allowedFields = [...PROFILE_FIELDS, ...SETTINGS_FIELDS];

    const illegalFields = incomingFields.filter(
      (key) => !allowedFields.includes(key),
    );

    if (illegalFields.length > 0) {
      throw new AppError(
        `You cannot update these fields via this endpoint: ${illegalFields.join(", ")}`,
        403,
      );
    }

    const updatedData: Partial<InstitutionEntity> = {};

    for (const key of incomingFields) {
      if (allowedFields.includes(key)) {
        // @ts-expect-error - Dynamically assigning keys safely
        updatedData[key] = payload[key];
      }
    }

    return executeTransaction(async (trxConnection) => {
      await institutionRepository.updateInstitutionData(
        institutionId,
        updatedData,
        trxConnection,
      );
    });
  }

  // Edit sensetive fields of an institution

  async editInstitutionSensetiveFields(
    institution_id: string,
    payload: {
      new_email?: string;
      new_password_plaintext?: string;
      current_password_plaintext: string;
    },
  ) {
    if (!payload.current_password_plaintext) {
      throw new AppError(
        "Current password is required to update sensetive data",
        401,
      );
    }

    return executeTransaction(async (trxConnection) => {
      const institution = await institutionRepository.findInstitutionById(
        institution_id,
        trxConnection,
      );

      if (!institution || institution === null) {
        throw new AppError("Institution not found", 404);
      }

      const isPasswordValid = bcrypt.compare(
        payload.current_password_plaintext,
        institution.institution_password_hashed,
      );

      if (!isPasswordValid) {
        throw new AppError("Incorrect Password", 401);
      }

      const updatedSensetiveData: Partial<InstitutionEntity> = {};

      if (payload.new_email) {
        updatedSensetiveData.institution_email = payload.new_email;
      }

      if (payload.new_password_plaintext) {
        updatedSensetiveData.institution_password_hashed = await bcrypt.hash(
          payload.new_password_plaintext,
          12,
        );
      }

      if (Object.keys(updatedSensetiveData).length === 0) {
        throw new AppError("No new data provided to update", 400);
      }

      await institutionRepository.updateInstitutionData(
        institution_id,
        updatedSensetiveData,
        trxConnection,
      );
    });
  }
}

export const editInstitutionService = new EditInstitutionService();
