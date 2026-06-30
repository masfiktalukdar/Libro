import bcrypt from "bcrypt";
import { executeTransaction } from "@config/dbConnect.js";
import { institutionRepository } from "@modules/institution/institution.repository.js";
import { InstitutionEntity } from "@modules/institution/institution.interface.js";
import { DepartmentEntity } from "@modules/institution/institution.validator.js";
import { AppError } from "@/utils/appError.js";
import { createInstitutionSlug } from "@/utils/createUniqueSlug.js";
import checkRequiredFields from "@/utils/checkRequiredFields.js";

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

  // * Editing general fields of an institution

  async editInstitutionGeneralFields(
    institution_id: string,
    payload: Partial<InstitutionEntity>,
  ): Promise<{ success: boolean; message: string }> {
    if (!institution_id) {
      throw new AppError("Please provide institution_id", 400);
    }

    if (!payload || Object.keys(payload).length === 0) {
      throw new AppError("Please enter required fields", 400);
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
      const institution = await institutionRepository.findInstitutionById(
        institution_id,
        trxConnection,
      );

      if (!institution || institution === null) {
        throw new AppError("Institution not found", 404);
      }

      await institutionRepository.updateInstitutionData(
        institution_id,
        updatedData,
        trxConnection,
      );

      return {
        success: true,
        message: `${incomingFields.join(",")} ${incomingFields.length > 1 ? "fields are" : "field is"} updated successfully`,
      };
    });
  }

  // * Edit sensetive fields of an institution

  async editInstitutionSensetiveFields(
    institution_id: string,
    payload: {
      institution_email?: string;
      new_password_plaintext?: string;
      institution_password_text: string;
    },
  ): Promise<{ success: boolean; message: string }> {
    if (!institution_id) {
      throw new AppError("Please provide institution_id", 400);
    }
    if (!payload || Object.keys(payload).length === 0) {
      throw new AppError("Please enter required fields", 400);
    }

    if (!payload.institution_password_text) {
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

      const isPasswordValid = await bcrypt.compare(
        payload.institution_password_text,
        institution.institution_password_hashed,
      );

      if (!isPasswordValid) {
        throw new AppError("Incorrect Password", 401);
      }

      const updatedSensetiveData: Partial<InstitutionEntity> = {};

      if (payload.institution_email) {
        updatedSensetiveData.institution_email = payload.institution_email;
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

      return {
        success: true,
        message: `${Object.keys(updatedSensetiveData).join(",")} ${Object.keys(updatedSensetiveData).length > 1 ? "fields are" : "field is"} updated successfully`,
      };
    });
  }

  // * Create new department for institution
  async createInstitutionDepartment(
    payload: Omit<DepartmentEntity, "department_id">,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!payload) {
        throw new AppError("Please enter required fields", 400);
      }

      const requiredFields = ["institution_id", "department_name"];
      checkRequiredFields(requiredFields, payload);

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          payload.institution_id,
          trxConnection,
        );

        if (!institution || institution === null) {
          throw new AppError("Invalid institution", 404);
        }

        const departmentId = crypto.randomUUID();
        const departmentEntity: DepartmentEntity = {
          department_id: departmentId,
          institution_id: payload.institution_id,
          department_name: payload.department_name,
        };

        await institutionRepository.createInstitutionDepartment(
          departmentEntity,
          trxConnection,
        );

        return {
          success: true,
          message: `${payload.department_name} has been created at ${institution.institution_name}`,
        };
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
