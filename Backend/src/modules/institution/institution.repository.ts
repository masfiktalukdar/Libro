import { dbPool } from "@config/dbConnect.js";
import { PoolConnection } from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  InstitutionRegistrationRequstEntity,
  InstitutionRegistrationRequestStatus,
  InstitutionEntity,
  HolidayType,
  InstitutionHolidayEntity,
  AutomaticRegistrationKeywordEntity,
  DepartmentEntity,
  FileAssetEntithy,
  InstitutionShiftEntity,
} from "@modules/institution/institution.validator.js";
import { AppError } from "@/utils/appError.js";

export class InstitutionRepository {
  // Section 1: Onboarding & Registration Requests

  // Find institution request by it's email
  async findInstitutionRequstByEmail(
    email: string,
  ): Promise<InstitutionRegistrationRequstEntity | null> {
    if (!email || email.trim().length === 0) {
      throw new AppError("Please enter a valid email", 400);
    }
    const normalizedInstitutionRegistrationRequstEmail =
      email.toLocaleLowerCase();

    const findInstitutionRequstByEmailSQL = `
      SELECT * FROM institution_registration_request 
      WHERE institution_email = ? AND deleted_at IS NULL LIMIT 1
    `;

    const [emails] = await dbPool.execute<RowDataPacket[]>(
      findInstitutionRequstByEmailSQL,
      [normalizedInstitutionRegistrationRequstEmail],
    );

    return (emails[0] as InstitutionRegistrationRequstEntity) || null;
  }

  // After finding, Create an institution registration request
  async createInstitutionRegistrationRequest(
    institutionRegistrationRequest: InstitutionRegistrationRequstEntity,
    trx: PoolConnection,
  ): Promise<InstitutionRegistrationRequstEntity> {
    try {
      const institutionRegistrationRequestSQL = `
      INSERT INTO institution_registration_request(institution_request_id, institution_name, institution_logo_url, institution_email, institution_founding_year, institution_eiin_number, institution_location, institution_type) 
      VALUES (?,?,?,?,?,?,?,?)
    `;

      await trx.execute<ResultSetHeader>(institutionRegistrationRequestSQL, [
        institutionRegistrationRequest.institution_request_id,
        institutionRegistrationRequest.institution_name,
        institutionRegistrationRequest.institution_logo_url,
        institutionRegistrationRequest.institution_email,
        institutionRegistrationRequest.institution_founding_year,
        institutionRegistrationRequest.institution_eiin_number,
        institutionRegistrationRequest.institution_location,
        institutionRegistrationRequest.institution_type,
      ]);

      return institutionRegistrationRequest;
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured ${err}`, 400);
    }
  }

  // Finding institution registration requst by institution_request_id
  async findInstitutionRegistrationRequest(
    institutionRequestId: string,
  ): Promise<InstitutionRegistrationRequstEntity> {
    const findInstitutionRequestSQL = `
      SELECT * FROM institution_registration_request WHERE institution_request_id = ?
    `;

    const [institutionRequest] = await dbPool.execute<RowDataPacket[]>(
      findInstitutionRequestSQL,
      [institutionRequestId],
    );

    return (
      (institutionRequest[0] as InstitutionRegistrationRequstEntity) || null
    );
  }

  // Edit institution registration request
  async editInstitutionRegistrationRequest(
    institutionRequestId: string,
    statusPayload: string,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const institutionRegistrationRequest =
        await this.findInstitutionRegistrationRequest(institutionRequestId);
      if (
        !institutionRegistrationRequest ||
        institutionRegistrationRequest === null
      ) {
        throw new AppError("No request found to edit", 400);
      }

      const editInstitutionRegistrationSQL = `
        UPDATE institution_registration_request SET registration_request_status = ? WHERE institution_request_id = ?
      `;

      await trx.execute<ResultSetHeader>(editInstitutionRegistrationSQL, [
        statusPayload,
        institutionRequestId,
      ]);
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Get registration requests with optional status or ID filtering
  async getRegistrationRequests(
    status?: InstitutionRegistrationRequestStatus,
    institution_request_id?: string,
    trx?: PoolConnection,
  ): Promise<InstitutionRegistrationRequstEntity[]> {
    try {
      const connection = trx || dbPool;
      let sql = `
        SELECT institution_request_id, institution_name, institution_logo_url, institution_email,
               institution_founding_year, institution_eiin_number, institution_location,
               institution_type, registration_request_status, created_at, updated_at
        FROM institution_registration_request
        WHERE deleted_at IS NULL
      `;
      const params: (string | number | boolean | null)[] = [];

      if (institution_request_id) {
        sql += ` AND institution_request_id = ?`;
        params.push(institution_request_id);
      }

      if (status) {
        sql += ` AND registration_request_status = ?`;
        params.push(status);
      }

      sql += ` ORDER BY created_at DESC`;

      const [rows] = await connection.execute<RowDataPacket[]>(sql, params);
      return rows as InstitutionRegistrationRequstEntity[];
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // find the existing institution with email and eiin number
  async isInstitutionExists(
    institutionEmail: string,
    institutionEiinNumber: string,
    trx: PoolConnection,
  ): Promise<boolean> {
    try {
      const findInstitutionSQL = `
        SELECT * FROM institution WHERE institution_email = ? OR institution_eiin_number = ?
      `;
      const [result] = await trx.execute<RowDataPacket[]>(findInstitutionSQL, [
        institutionEmail,
        institutionEiinNumber,
      ]);
      if (!result || result === undefined || result.length === 0) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Creating a new institution
  async createNewInstitution(
    payload: InstitutionEntity,
    trx: PoolConnection,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const createNewInstitutionSQL = `
      INSERT INTO institution(institution_id, institution_name, institution_short_form, institution_slug, institution_logo_url, institution_email, institution_password_hashed, institution_founding_year, institution_eiin_number, institution_location, institution_type, student_approval_system, membership_fee_type, membership_fee_amount, student_book_borrow_limit, student_fine_limit_amount, reservation_expiry_in_minutes, library_opening_time, library_closing_time) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

      await trx.execute<ResultSetHeader>(createNewInstitutionSQL, [
        payload.institution_id,
        payload.institution_name,
        payload.institution_short_form,
        payload.institution_slug,
        payload.institution_logo_url,
        payload.institution_email,
        payload.institution_password_hashed,
        payload.institution_founding_year,
        payload.institution_eiin_number,
        payload.institution_location,
        payload.institution_type,
        payload.student_approval_system,
        payload.membership_fee_type,
        payload.membership_fee_amount,
        payload.student_book_borrow_limit,
        payload.student_fine_limit_amount,
        payload.reservation_expiry_in_minutes,
        payload.library_opening_time,
        payload.library_closing_time,
      ]);

      return {
        success: true,
        message: `${payload.institution_name} has been created successfully`,
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error accoured: ${err}`, 500);
    }
  }

  // Section 2: Institution Profile & Settings

  // Find institution by id
  async findInstitutionById(
    institution_id: string,
    trx?: PoolConnection,
  ): Promise<InstitutionEntity | null> {
    try {
      const findInstitutionByIdSQL = `
        SELECT * FROM institution WHERE institution_id = ? LIMIT 1
      `;

      const connection = trx || dbPool;
      const [rows] = await connection.execute<RowDataPacket[]>(
        findInstitutionByIdSQL,
        [institution_id],
      );
      return (rows[0] as InstitutionEntity) || null;
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Find institution by slug
  async findInstitutionBySlug(
    institution_slug: string,
    trx?: PoolConnection,
  ): Promise<InstitutionEntity | null> {
    try {
      const findInstitutionBySlugSQL = `
        SELECT * FROM institution WHERE institution_slug = ? LIMIT 1
      `;
      const connection = trx || dbPool;
      const [rows] = await connection.execute<RowDataPacket[]>(
        findInstitutionBySlugSQL,
        [institution_slug],
      );
      return (rows[0] as InstitutionEntity) || null;
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // edit institution name
  async updateInstitutionName(
    institution_name: string,
    institution_id: string,
    instituion_slug: string,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const updateInstitutionNameSQL = `
        UPDATE institution SET institution_name = ?, institution_slug = ? WHERE institution_id = ? LIMIT 1
      `;

      await trx.execute<ResultSetHeader>(updateInstitutionNameSQL, [
        institution_name,
        instituion_slug,
        institution_id,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected DB error occoured: ${err}`, 500);
    }
  }

  // * Update institution fields
  async updateInstitutionData(
    institution_id: string,
    updatedData: Partial<InstitutionEntity>,
    trx: PoolConnection,
  ) {
    try {
      const fields = Object.keys(updatedData) as (keyof InstitutionEntity)[];
      if (!fields || fields.length === 0) {
        throw new AppError("No fields found to update", 400);
      }
      const setClause = fields.map((field) => `${String(field)} = ?`).join(",");

      const values = fields.map((field) => updatedData[field] ?? null);

      const updateInstitutionDataSQL = `
        UPDATE institution SET ${setClause} WHERE institution_id = ?
      `;

      await trx.execute(updateInstitutionDataSQL, [...values, institution_id]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Section 3: Academic Departments

  // * Get all departments for an institution
  async getInstitutionDepartments(
    institution_id: string,
    trx?: PoolConnection,
  ): Promise<DepartmentEntity[]> {
    try {
      const connection = trx || dbPool;
      const sql = `
        SELECT department_id, institution_id, department_name, created_at, updated_at
        FROM departments
        WHERE institution_id = ?
        ORDER BY department_name ASC
      `;
      const [rows] = await connection.execute<RowDataPacket[]>(sql, [
        institution_id,
      ]);
      return rows as DepartmentEntity[];
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Create department for institution
  async createInstitutionDepartment(
    payload: DepartmentEntity,
    trx: PoolConnection,
  ) {
    try {
      const createDepartmentSQL = `
        INSERT INTO departments (department_id, institution_id, department_name) 
        VALUES (?,?,?)
      `;

      await trx.execute(createDepartmentSQL, [
        payload.department_id,
        payload.institution_id,
        payload.department_name,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Delete department for institution
  async deleteInstitutionDepartment(
    department_id: string,
    institution_id: string,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const deleteInstitutionDepartmentSQL = `
        DELETE FROM departments WHERE department_id = ? AND institution_id = ?
      `;

      await trx.execute(deleteInstitutionDepartmentSQL, [
        department_id,
        institution_id,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Section 4: Academic Shifts

  // * Get all shifts for an institution
  async getInstitutionShifts(
    institution_id: string,
    trx?: PoolConnection,
  ): Promise<InstitutionShiftEntity[]> {
    try {
      const connection = trx || dbPool;
      const sql = `
        SELECT shift_id, institution_id, shift_name, shift_start_time, shift_end_time, created_at, updated_at
        FROM shifts
        WHERE institution_id = ?
        ORDER BY shift_start_time ASC
      `;
      const [rows] = await connection.execute<RowDataPacket[]>(sql, [
        institution_id,
      ]);
      return rows as InstitutionShiftEntity[];
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * find shift for institution
  async findInstitutionShift(
    shift_id: string,
    institution_id: string,
    trx: PoolConnection,
  ): Promise<InstitutionShiftEntity> {
    try {
      const findInstitutionShiftSQL = `
        SELECT * FROM shifts WHERE shift_id = ? AND institution_id = ? LIMIT 1
      `;

      const [result] = await trx.execute(findInstitutionShiftSQL, [
        shift_id,
        institution_id,
      ]);
      const institutionShift = (result as InstitutionShiftEntity[])[0];

      return institutionShift;
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Create shift for institution
  async createInstitutionShift(
    payload: InstitutionShiftEntity,
    trx: PoolConnection,
  ) {
    try {
      const createInstitutionShiftSQL = `
        INSERT INTO shifts (shift_id, institution_id, shift_name, shift_start_time, shift_end_time) 
        VALUES (?,?,?,?,?)
      `;

      await trx.execute(createInstitutionShiftSQL, [
        payload.shift_id,
        payload.institution_id,
        payload.shift_name,
        payload.shift_start_time,
        payload.shift_end_time,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * update shift for institution
  async updateInstitutionShift(
    shift_id: string,
    institution_id: string,
    payload: Omit<InstitutionShiftEntity, "shift_id" | "institution_id">,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const updateInstitutionShiftSQL = `
        UPDATE shifts SET shift_name = ?, shift_start_time = ?, shift_end_time = ? 
        WHERE shift_id = ? AND institution_id = ?
      `;
      await trx.execute(updateInstitutionShiftSQL, [
        payload.shift_name,
        payload.shift_start_time,
        payload.shift_end_time,
        shift_id,
        institution_id,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Delete shift for institution
  async deleteInstitutionShift(
    shift_id: string,
    institution_id: string,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const deleteInstitutionShiftSQL = `
        DELETE FROM shifts WHERE shift_id = ? AND institution_id = ?
      `;

      await trx.execute(deleteInstitutionShiftSQL, [shift_id, institution_id]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Section 5: Document Assets & Verification Examples

  // * Get document assets for an institution (including system templates)
  async getInstitutionDocuments(
    institution_id: string,
    asset_scope?: "system_template" | "tenant_private",
    trx?: PoolConnection,
  ): Promise<FileAssetEntithy[]> {
    try {
      const connection = trx || dbPool;
      let sql: string;
      let params: (string | number | boolean | null)[];

      if (asset_scope === "tenant_private") {
        sql = `
          SELECT asset_id, institution_id, file_url, file_type, asset_scope, created_at
          FROM file_assets
          WHERE institution_id = ? AND asset_scope = 'tenant_private'
          ORDER BY created_at DESC
        `;
        params = [institution_id];
      } else if (asset_scope === "system_template") {
        sql = `
          SELECT asset_id, institution_id, file_url, file_type, asset_scope, created_at
          FROM file_assets
          WHERE asset_scope = 'system_template'
          ORDER BY created_at DESC
        `;
        params = [];
      } else {
        sql = `
          SELECT asset_id, institution_id, file_url, file_type, asset_scope, created_at
          FROM file_assets
          WHERE institution_id = ? OR asset_scope = 'system_template'
          ORDER BY created_at DESC
        `;
        params = [institution_id];
      }

      const [rows] = await connection.execute<RowDataPacket[]>(sql, params);
      return rows as FileAssetEntithy[];
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Add file for document example dispay
  async addInstitutionAssetExample(
    payload: FileAssetEntithy,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const addInstitutionAssetExampleSQL = `
        INSERT INTO file_assets (asset_id, institution_id, file_url, file_type, asset_scope) 
        VALUES (?,?,?,?,?)
      `;

      await trx.execute(addInstitutionAssetExampleSQL, [
        payload.asset_id,
        payload.institution_id,
        payload.file_url,
        payload.file_type,
        payload.asset_scope,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Delete file for document example dispay
  async deleteInstitutionAssetExample(
    asset_id: string,
    instittuion_id: string,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const deleteInstitutionAssetExampleSQL = `
        DELETE FROM file_assets WHERE asset_id = ? AND institution_id = ?
      `;

      await trx.execute(deleteInstitutionAssetExampleSQL, [
        asset_id,
        instittuion_id,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Section 6: Registration Automation Keywords

  // * Get automatic registration keywords for an institution
  async getAutomaticRegistrationKeywords(
    institution_id: string,
    trx?: PoolConnection,
  ): Promise<AutomaticRegistrationKeywordEntity[]> {
    try {
      const connection = trx || dbPool;
      const sql = `
        SELECT keyword_id, institution_id, keyword_value, created_at, updated_at
        FROM automatic_registration_keyword
        WHERE institution_id = ?
        ORDER BY created_at DESC
      `;
      const [rows] = await connection.execute<RowDataPacket[]>(sql, [
        institution_id,
      ]);
      return rows as AutomaticRegistrationKeywordEntity[];
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Add institution automatic keyword
  async addAutomaticRegistrationKeyword(
    payload: AutomaticRegistrationKeywordEntity,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const addAutomaticRegistrationKeywordSQL = `
        INSERT INTO automatic_registration_keyword (keyword_id, institution_id, keyword_value) 
        VALUES (?,?,?)
      `;

      await trx.execute(addAutomaticRegistrationKeywordSQL, [
        payload.keyword_id,
        payload.institution_id,
        payload.keyword_value,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Remove institution automatic keyword
  async removeAutomaticRegistrationKeyword(
    keyword_id: string,
    institution_id: string,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const removeAutomaticRegistrationKeywordSQL = `
        DELETE FROM automatic_registration_keyword 
        WHERE keyword_id = ? AND institution_id = ?
      `;

      await trx.execute(removeAutomaticRegistrationKeywordSQL, [
        keyword_id,
        institution_id,
      ]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // Section 7: Holidays & Calendar

  // * Get all holidays for institution
  async getInstitutionHolidays(
    institution_id: string,
    holiday_type?: HolidayType,
    trx?: PoolConnection,
  ): Promise<InstitutionHolidayEntity[]> {
    try {
      const connection = trx || dbPool;
      if (holiday_type) {
        const sql = `
          SELECT * FROM institution_holidays 
          WHERE institution_id = ? AND holiday_type = ?
          ORDER BY holiday_value ASC
        `;
        const [rows] = await connection.execute<RowDataPacket[]>(sql, [
          institution_id,
          holiday_type,
        ]);
        return rows as InstitutionHolidayEntity[];
      }
      const sql = `
        SELECT * FROM institution_holidays 
        WHERE institution_id = ? 
        ORDER BY holiday_type ASC, holiday_value ASC
      `;
      const [rows] = await connection.execute<RowDataPacket[]>(sql, [
        institution_id,
      ]);
      return rows as InstitutionHolidayEntity[];
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Find holiday by id
  async findHolidayById(
    holiday_id: string,
    institution_id: string,
    trx?: PoolConnection,
  ): Promise<InstitutionHolidayEntity | null> {
    try {
      const sql = `
        SELECT * FROM institution_holidays 
        WHERE institution_holidays_id = ? AND institution_id = ? LIMIT 1
      `;
      const connection = trx || dbPool;
      const [rows] = await connection.execute<RowDataPacket[]>(sql, [
        holiday_id,
        institution_id,
      ]);
      return (rows[0] as InstitutionHolidayEntity) || null;
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Find existing holidays by value list
  async findExistingHolidaysByValues(
    institution_id: string,
    holiday_type: HolidayType,
    values: string[],
    trx?: PoolConnection,
  ): Promise<InstitutionHolidayEntity[]> {
    try {
      if (values.length === 0) return [];
      const placeholders = values.map(() => "?").join(", ");
      const sql = `
        SELECT * FROM institution_holidays 
        WHERE institution_id = ? AND holiday_type = ? AND holiday_value IN (${placeholders})
      `;
      const connection = trx || dbPool;
      const [rows] = await connection.execute<RowDataPacket[]>(sql, [
        institution_id,
        holiday_type,
        ...values,
      ]);
      return rows as InstitutionHolidayEntity[];
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Batch add institution holidays
  async addInstitutionHolidaysBatch(
    holidays: InstitutionHolidayEntity[],
    trx: PoolConnection,
  ): Promise<void> {
    try {
      if (holidays.length === 0) return;
      const placeholders = holidays.map(() => "(?, ?, ?, ?)").join(", ");
      const params = holidays.flatMap((h) => [
        h.institution_holidays_id,
        h.institution_id,
        h.holiday_type,
        h.holiday_value,
      ]);
      const sql = `
        INSERT INTO institution_holidays (institution_holidays_id, institution_id, holiday_type, holiday_value)
        VALUES ${placeholders}
      `;
      await trx.execute(sql, params);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // * Delete holiday for institution
  async deleteInstitutionHoliday(
    holiday_id: string,
    institution_id: string,
    trx: PoolConnection,
  ): Promise<void> {
    try {
      const sql = `
        DELETE FROM institution_holidays 
        WHERE institution_holidays_id = ? AND institution_id = ?
      `;
      await trx.execute(sql, [holiday_id, institution_id]);
    } catch (err) {
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }
}

export const institutionRepository = new InstitutionRepository();
