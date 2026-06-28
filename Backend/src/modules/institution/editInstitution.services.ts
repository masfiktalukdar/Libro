import bcrypt from "bcrypt";
import { executeTransaction } from "@config/dbConnect.js";
import { institutionRepository } from "@modules/institution/institution.repository.js";
import { InstitutionEntity } from "@modules/institution/institution.interface.js";
import { AppError } from "@/utils/appError.js";
import { createInstitutionSlug } from "@/utils/createUniqueSlug.js";

// Identify the fields
export const PROFILE_FIELDS = [
  "institution_short_form",
  "institution_logo_url",
  "institution_founding_year",
  "institution_location",
];

export const SETTINGS_FIELDS = [
  "student_approval_system",
  "membership_fee_type",
  "membership_fee_amount",
  "student_book_borrow_limit",
  "student_fine_limit_amount",
  "reservation_expiry_in_minutes",
  "library_opening_time",
  "library_closing_time",
];

export const SENSITIVE_FIELDS = [
  "institution_email",
  "institution_password_hashed",
];

export const IMMUTABLE_FIELDS = [
  "institution_id",
  "institution_eiin_number",
  "institution_type",
  "created_at",
  "updated_at",
  "deleted_at",
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
}

export const editInstitutionService = new EditInstitutionService();
