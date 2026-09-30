import bcrypt from "bcrypt";
import crypto from "crypto";
import { executeTransaction } from "@config/dbConnect.js";
import { institutionRepository } from "@modules/institution/institution.repository.js";
import {
  AddManualHolidayInput,
  AddRecurringHolidayInput,
  AutomaticRegistrationKeywordEntity,
  DepartmentEntity,
  FileAssetEntithy,
  HolidayType,
  InstitutionEntity,
  InstitutionHolidayEntity,
  InstitutionShiftEntity,
} from "@modules/institution/institution.validator.js";
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

        const findDepartmentNameSQL = `SELECT * FROM departments WHERE 
        institution_id = ? AND department_name = ? LIMIT 1`;

        const [result] = await trxConnection.execute(findDepartmentNameSQL, [
          payload.institution_id,
          payload.department_name,
        ]);
        const isDepartmentNameExists = (result as DepartmentEntity[])[0];
        if (isDepartmentNameExists) {
          throw new AppError("Duplicate department exists", 403);
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

  // * Delete department for institution

  async deleteInstitutionDepartment(
    department_id: string,
    institution_id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!department_id || !institution_id) {
        throw new AppError("Please enter required fields", 400);
      }

      return executeTransaction(async (trxConnection) => {
        // Finding the department if exists
        const findDepartmentSQL = `SELECT * FROM departments WHERE 
        department_id = ? AND institution_id = ? LIMIT 1`;

        const [result] = await trxConnection.execute(findDepartmentSQL, [
          department_id,
          institution_id,
        ]);
        const department = (result as DepartmentEntity[])[0];
        if (!department) {
          throw new AppError("No department found to delete", 404);
        }

        // Finding the institution
        const institution = await institutionRepository.findInstitutionById(
          institution_id,
          trxConnection,
        );
        if (!institution) {
          throw new AppError("No institution found", 404);
        }

        await institutionRepository.deleteInstitutionDepartment(
          department_id,
          institution_id,
          trxConnection,
        );

        return {
          success: true,
          message: `"${department.department_name}" department has been deleted successfully`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured ${err}`, 500);
    }
  }

  // * Create new shift for institution
  async createInstitutionShift(
    payload: Omit<InstitutionShiftEntity, "shift_id">,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!payload) {
        throw new AppError("Please enter required fields", 400);
      }

      const requiredFields = [
        "institution_id",
        "shift_name",
        "shift_start_time",
        "shift_end_time",
      ];
      checkRequiredFields(requiredFields, payload);

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          payload.institution_id,
          trxConnection,
        );

        if (!institution || institution === null) {
          throw new AppError("Invalid institution", 404);
        }

        const findInstitutionShiftSQL = `SELECT * FROM shifts
        WHERE institution_id = ? AND (
          shift_name = ?
          OR (
            ? < shift_end_time
            AND ? > shift_start_time
          )
        ) LIMIT 1;`;

        const [result] = await trxConnection.execute(findInstitutionShiftSQL, [
          payload.institution_id,
          payload.shift_name,
          payload.shift_start_time,
          payload.shift_end_time,
        ]);
        const isInstitutionShiftExists = (
          result as InstitutionShiftEntity[]
        )[0];

        if (isInstitutionShiftExists) {
          throw new AppError(
            "Institution shift overlap. Please put correct information",
            403,
          );
        }

        if (payload.shift_end_time <= payload.shift_start_time) {
          throw new AppError(
            "Shift end time must be later than shift start time.",
            400,
          );
        }

        const shiftId = crypto.randomUUID();
        const shiftEntity: InstitutionShiftEntity = {
          shift_id: shiftId,
          institution_id: payload.institution_id,
          shift_name: payload.shift_name,
          shift_start_time: payload.shift_start_time,
          shift_end_time: payload.shift_end_time,
        };

        await institutionRepository.createInstitutionShift(
          shiftEntity,
          trxConnection,
        );

        return {
          success: true,
          message: `${payload.shift_name} shift has been created at ${institution.institution_name}`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * update shift for institution

  async updateInstitutionShift(
    shift_id: string,
    institution_id: string,
    payload: Omit<InstitutionShiftEntity, "shift_id" | "institution_id">,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!payload) {
        throw new AppError("Please enter required fields", 400);
      }

      const requiredFields = [
        "shift_name",
        "shift_start_time",
        "shift_end_time",
      ];
      checkRequiredFields(requiredFields, payload);

      if (!shift_id || !institution_id) {
        throw new AppError("shift id and institution id is required", 401);
      }

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          institution_id,
          trxConnection,
        );

        if (!institution || institution === null) {
          throw new AppError("Invalid institution", 404);
        }

        const institutionShift =
          await institutionRepository.findInstitutionShift(
            shift_id,
            institution_id,
            trxConnection,
          );

        if (!institutionShift) {
          throw new AppError("No shift found to edit", 404);
        }

        const findInstitutionShiftSQL = `SELECT * FROM shifts
        WHERE shift_id = ? AND institution_id = ? AND (
          shift_name = ?
          OR (
            ? < shift_end_time
            AND ? > shift_start_time
          )
        ) LIMIT 1;`;

        const [result] = await trxConnection.execute(findInstitutionShiftSQL, [
          shift_id,
          institution_id,
          payload.shift_name,
          payload.shift_start_time,
          payload.shift_end_time,
        ]);

        const isInstitutionShiftOverlaps = (
          result as InstitutionShiftEntity[]
        )[0];
        if (isInstitutionShiftOverlaps) {
          throw new AppError(
            "Institution shift overlap. Please put correct information",
            403,
          );
        }

        if (payload.shift_end_time <= payload.shift_start_time) {
          throw new AppError(
            "Shift end time must be later than shift start time.",
            400,
          );
        }

        const updatedShiftEntity: Omit<
          InstitutionShiftEntity,
          "shift_id" | "institution_id"
        > = {
          shift_name: payload.shift_name,
          shift_start_time: payload.shift_start_time,
          shift_end_time: payload.shift_end_time,
        };

        await institutionRepository.updateInstitutionShift(
          shift_id,
          institution_id,
          updatedShiftEntity,
          trxConnection,
        );

        return {
          success: true,
          message: `${payload.shift_name} shift has been updated successfully!`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * delete shift for institution

  async deleteInstitutionShift(
    shift_id: string,
    institution_id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!shift_id || !institution_id) {
        throw new AppError("Please enter required fields", 401);
      }
      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          institution_id,
          trxConnection,
        );

        if (!institution || institution === null) {
          throw new AppError("Invalid institution", 404);
        }

        const institutionShift =
          await institutionRepository.findInstitutionShift(
            shift_id,
            institution_id,
            trxConnection,
          );

        if (!institutionShift) {
          throw new AppError("No institution shift found", 404);
        }

        await institutionRepository.deleteInstitutionShift(
          shift_id,
          institution_id,
          trxConnection,
        );

        return {
          success: true,
          message: `${institutionShift.shift_name} shift has been deleted successfully!`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Add file for document example dispay

  async addInstitutionAssetExample(
    payload: Omit<FileAssetEntithy, "asset_id">,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!payload || Object.keys(payload).length === 0) {
        throw new AppError("Please enter required fields", 401);
      }

      const requiredFields = ["institution_id", "file_url", "file_type"];

      checkRequiredFields(requiredFields, payload);

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          payload.institution_id,
          trxConnection,
        );

        if (!institution || institution === null) {
          throw new AppError("Invalid institution", 404);
        }

        const assetId = crypto.randomUUID();

        const addInstitutionAssetExampleEntity: FileAssetEntithy = {
          asset_id: assetId,
          institution_id: payload.institution_id,
          file_type: payload.file_type,
          asset_scope: "system_template",
          file_url: payload.file_url,
        };

        await institutionRepository.addInstitutionAssetExample(
          addInstitutionAssetExampleEntity,
          trxConnection,
        );

        return {
          success: true,
          message: `Document is successfully added to ${institution.institution_name}`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Delete file for document example dispay

  async deleteInstitutionAssetExample(
    asset_id: string,
    institution_id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!asset_id || !institution_id) {
        throw new AppError("Please enter required fields", 401);
      }

      return executeTransaction(async (trxConnection) => {
        const assetFindSQL = `
          SELECT * FROM file_assets WHERE asset_id = ? AND institution_id = ?
        `;

        const [result] = await trxConnection.execute(assetFindSQL, [
          asset_id,
          institution_id,
        ]);

        if (!result || result === null) {
          throw new AppError("No document found to delete", 404);
        }

        await institutionRepository.deleteInstitutionAssetExample(
          asset_id,
          institution_id,
          trxConnection,
        );

        return {
          success: true,
          message: "Selected docuemnt is deleted successfully",
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Add Institution automatic registration keyword

  async addAutomaticRegistrationKeyword(
    payload: Omit<AutomaticRegistrationKeywordEntity, "keyword_id">,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!payload || Object.keys(payload).length === 0) {
        throw new AppError("Please enter required fields", 401);
      }

      const requiredFields = ["institution_id", "keyword_value"];
      checkRequiredFields(requiredFields, payload);

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          payload.institution_id,
          trxConnection,
        );

        if (!institution || institution === null) {
          throw new AppError("Invalid institution", 404);
        }

        const keywordId = crypto.randomUUID();

        const automaticRegistrationKeywordEntity: AutomaticRegistrationKeywordEntity =
          {
            keyword_id: keywordId,
            institution_id: payload.institution_id,
            keyword_value: payload.keyword_value,
          };

        await institutionRepository.addAutomaticRegistrationKeyword(
          automaticRegistrationKeywordEntity,
          trxConnection,
        );

        return {
          success: true,
          message: `${payload.keyword_value} has successfully added to ${institution.institution_name}`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Remove Institution automatic registration keyword

  async removeAutomaticRegistrationKeyword(
    keyword_id: string,
    institution_id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!keyword_id || !institution_id) {
        throw new AppError("Please enter required fields", 401);
      }

      return executeTransaction(async (trxConnection) => {
        const findAutomaticRegistrationKeywordSQL = `
          SELECT * FROM automatic_registration_keyword WHERE keyword_id = ? AND institution_id = ?
        `;

        const [result] = await trxConnection.execute(
          findAutomaticRegistrationKeywordSQL,
          [keyword_id, institution_id],
        );

        if (!result || result === null) {
          throw new AppError("No keyword found to remove", 404);
        }

        await institutionRepository.removeAutomaticRegistrationKeyword(
          keyword_id,
          institution_id,
          trxConnection,
        );

        return {
          success: true,
          message: `Selected keyword deleted successfully`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Add recurring holiday(s) for institution (e.g. weekly closures like Friday, Saturday)
  async addRecurringHoliday(
    payload: AddRecurringHolidayInput,
  ): Promise<{
    success: boolean;
    message: string;
    count: number;
    addedHolidays: InstitutionHolidayEntity[];
  }> {
    try {
      if (!payload || !payload.institution_id) {
        throw new AppError("Institution ID is required", 400);
      }

      // Normalize incoming day/days
      const rawDays = [
        payload.day,
        payload.day_of_week,
        ...(payload.days || []),
        ...(payload.days_of_week || []),
      ].filter(Boolean) as string[];

      // Unique lowercase day names
      const targetDays = Array.from(
        new Set(rawDays.map((d) => d.trim().toLowerCase())),
      );

      if (targetDays.length === 0) {
        throw new AppError(
          "Please provide at least one valid recurring weekday name",
          400,
        );
      }

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          payload.institution_id,
          trxConnection,
        );

        if (!institution) {
          throw new AppError("Invalid institution", 404);
        }

        // Check which recurring days are already registered
        const existing =
          await institutionRepository.findExistingHolidaysByValues(
            payload.institution_id,
            "recurring",
            targetDays,
            trxConnection,
          );
        const existingDays = new Set(
          existing.map((e) => e.holiday_value.toLowerCase()),
        );

        const daysToInsert = targetDays.filter((d) => !existingDays.has(d));

        if (daysToInsert.length === 0) {
          throw new AppError(
            `The recurring holiday(s) [${targetDays.join(", ")}] are already registered for this institution`,
            400,
          );
        }

        const holidayEntities: InstitutionHolidayEntity[] = daysToInsert.map(
          (day) => ({
            institution_holidays_id: crypto.randomUUID(),
            institution_id: payload.institution_id,
            holiday_type: "recurring",
            holiday_value: day,
          }),
        );

        await institutionRepository.addInstitutionHolidaysBatch(
          holidayEntities,
          trxConnection,
        );

        const skippedMsg =
          existingDays.size > 0
            ? ` ([${Array.from(existingDays).join(", ")}] were already registered)`
            : "";

        return {
          success: true,
          message: `Recurring holiday(s) [${daysToInsert.join(", ")}] added successfully!${skippedMsg}`,
          count: holidayEntities.length,
          addedHolidays: holidayEntities,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Add manual holiday for institution (single particular date or a date range from starting to ending date)
  async addManualHoliday(
    payload: AddManualHolidayInput,
  ): Promise<{
    success: boolean;
    message: string;
    count: number;
    addedHolidays: InstitutionHolidayEntity[];
  }> {
    try {
      if (!payload || !payload.institution_id) {
        throw new AppError("Institution ID is required", 400);
      }

      const startDate = payload.start_date || payload.date;
      const endDate = payload.end_date || startDate;

      if (!startDate || !endDate) {
        throw new AppError(
          "Please provide a valid date or date range in YYYY-MM-DD format",
          400,
        );
      }

      if (startDate > endDate) {
        throw new AppError(
          "start_date cannot be later than end_date",
          400,
        );
      }

      // Generate all dates in range [startDate, endDate] (timezone-safe using UTC)
      const [sYear, sMonth, sDay] = startDate.split("-").map(Number);
      const [eYear, eMonth, eDay] = endDate.split("-").map(Number);
      const cur = new Date(Date.UTC(sYear, sMonth - 1, sDay));
      const last = new Date(Date.UTC(eYear, eMonth - 1, eDay));

      const diffTime = last.getTime() - cur.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 365) {
        throw new AppError(
          "Manual holiday date range cannot exceed 365 days per request",
          400,
        );
      }

      const datesInRange: string[] = [];
      while (cur <= last) {
        datesInRange.push(cur.toISOString().slice(0, 10));
        cur.setUTCDate(cur.getUTCDate() + 1);
      }

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          payload.institution_id,
          trxConnection,
        );

        if (!institution) {
          throw new AppError("Invalid institution", 404);
        }

        // Check which dates already exist as manual holidays
        const existing =
          await institutionRepository.findExistingHolidaysByValues(
            payload.institution_id,
            "manual",
            datesInRange,
            trxConnection,
          );
        const existingDates = new Set(existing.map((e) => e.holiday_value));

        const datesToInsert = datesInRange.filter((d) => !existingDates.has(d));

        if (datesToInsert.length === 0) {
          throw new AppError(
            datesInRange.length === 1
              ? `Date ${datesInRange[0]} is already registered as a holiday`
              : "All dates in the specified range are already registered as holidays",
            400,
          );
        }

        const holidayEntities: InstitutionHolidayEntity[] = datesToInsert.map(
          (date) => ({
            institution_holidays_id: crypto.randomUUID(),
            institution_id: payload.institution_id,
            holiday_type: "manual",
            holiday_value: date,
          }),
        );

        await institutionRepository.addInstitutionHolidaysBatch(
          holidayEntities,
          trxConnection,
        );

        const skippedMsg =
          existingDates.size > 0
            ? ` (${existingDates.size} date(s) were already registered and skipped)`
            : "";

        return {
          success: true,
          message:
            datesInRange.length === 1
              ? `Holiday for ${datesToInsert[0]} added successfully!`
              : `Successfully added ${datesToInsert.length} holiday day(s) from ${startDate} to ${endDate}!${skippedMsg}`,
          count: holidayEntities.length,
          addedHolidays: holidayEntities,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Delete holiday for institution
  async deleteInstitutionHoliday(
    holiday_id: string,
    institution_id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      if (!holiday_id || !institution_id) {
        throw new AppError(
          "institution_holidays_id and institution_id are required",
          400,
        );
      }

      return executeTransaction(async (trxConnection) => {
        const institution = await institutionRepository.findInstitutionById(
          institution_id,
          trxConnection,
        );

        if (!institution) {
          throw new AppError("Invalid institution", 404);
        }

        const holiday = await institutionRepository.findHolidayById(
          holiday_id,
          institution_id,
          trxConnection,
        );

        if (!holiday) {
          throw new AppError("No holiday found to delete", 404);
        }

        await institutionRepository.deleteInstitutionHoliday(
          holiday_id,
          institution_id,
          trxConnection,
        );

        return {
          success: true,
          message: `Holiday (${holiday.holiday_type}: ${holiday.holiday_value}) has been deleted successfully!`,
        };
      });
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Get all holidays for institution
  async getInstitutionHolidays(
    institution_id: string,
    holiday_type?: HolidayType,
  ): Promise<{
    success: boolean;
    data: InstitutionHolidayEntity[];
  }> {
    try {
      if (!institution_id) {
        throw new AppError("institution_id is required", 400);
      }

      const institution =
        await institutionRepository.findInstitutionById(institution_id);

      if (!institution) {
        throw new AppError("Invalid institution", 404);
      }

      const holidays = await institutionRepository.getInstitutionHolidays(
        institution_id,
        holiday_type,
      );

      return {
        success: true,
        data: holidays,
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }
}

export const editInstitutionService = new EditInstitutionService();
