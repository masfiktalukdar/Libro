import { dbPool } from "@config/dbConnect.js";
import { PoolConnection } from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import {
  InstitutionRegistrationRequstEntity,
  InstitutionEntity,
} from "@modules/institution/institution.interface.js";
import { AppError } from "@/utils/appError.js";

export class InstitutionRepository {
  // Find institution request by it's email
  async findInstitutionRequstByEmail(
    email: string,
  ): Promise<InstitutionRegistrationRequstEntity | null> {
    if (!email || email.trim().length === 0) return null;
    const normalizedInstitutionRegistrationRequstEmail =
      email.toLocaleLowerCase();

    const findInstitutionRequstByEmailSQL = `
      SELECT * FROM institution_registration_request 
      WHERE institution_email = ? AND deleted_at = null LIMIT 1
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
        institutionRegistrationRequest.registration_request_status,
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
  ): Promise<{ success: boolean; message: string }> {
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
        UPDATE institution_registration_request SET registration_request_status = ?
      `;

      await trx.execute<ResultSetHeader>(editInstitutionRegistrationSQL, [
        statusPayload,
      ]);
      return {
        success: true,
        message: `${institutionRegistrationRequest.institution_name} is ${institutionRegistrationRequest.registration_request_status}`,
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error occoured: ${err}`, 500);
    }
  }

  // create a new institution

  // Creating a new institution
  async createNewInstitution(
    institutionRequestIdPayload: string,
    payload: InstitutionEntity,
    trx: PoolConnection,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const institutionRegistrationRequest =
        await this.findInstitutionRegistrationRequest(
          institutionRequestIdPayload,
        );
      if (
        !institutionRegistrationRequest ||
        institutionRegistrationRequest === null
      ) {
        throw new AppError("No request found by this id", 400);
      }
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

      if (registration_request_status !== "approved") {
        throw new AppError("This institution request is not approved", 400);
      }

      const createNewInstitutionSQL = `
      INSERT INTO institution(institution_id, institution_name, institution_short_form, institution_slug, institution_logo_url, institution_email, institution_founding_year, institution_eiin_number, institution_location, institution_type, student_approval_system, membership_fee_type, membership_fee_amount, student_book_borrow_limit, student_fine_limit_amount, reservation_expiry_in_minutes, library_opening_time, library_closing_time) 
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

      await trx.execute<ResultSetHeader>(createNewInstitutionSQL, [
        payload.institution_id,
        institution_name,
        payload.institution_short_form,
        payload.institution_slug,
        payload.institution_logo_url && institution_logo_url,
        institution_email,
        institution_founding_year,
        institution_eiin_number,
        institution_location,
        institution_type,
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
        message: `${institution_name} has been created successfully`,
      };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(`Unexpected error accoured: ${err}`, 500);
    }
  }
}

export const institutionRepository = new InstitutionRepository();
