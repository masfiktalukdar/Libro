import { dbPool } from "@config/dbConnect.js";
import { PoolConnection } from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { InstitutionRegistrationRequstEntity } from "@modules/institution/institution.interface.js";
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
}

export const institutionRepository = new InstitutionRepository();
