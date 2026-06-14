import { PoolConnection } from "mysql2/promise";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { InstitutionRegistrationRequstEntity } from "@modules/institution/institution.interface.js";

export class InstitutionRepository {
  async findInstitutionRequstByEmail(
    email: string,
    trx: PoolConnection,
  ): Promise<InstitutionRegistrationRequstEntity | null> {
    if (!email || email.trim().length === 0) return null;
    const normalizedInstitutionRegistrationRequstEmail =
      email.toLocaleLowerCase();

    const findInstitutionRequstByEmailSQL = `
      SELECT * FROM institution_registration_request 
      WHERE institution_email = ? AND deleted_at = null LIMIT 1
    `;

    const [emails] = await trx.execute<RowDataPacket[]>(
      findInstitutionRequstByEmailSQL,
      [normalizedInstitutionRegistrationRequstEmail],
    );

    return (emails[0] as InstitutionRegistrationRequstEntity) || null;
  }

  async createInstitutionRegistrationRequest(
    institutionRegistrationRequest: InstitutionRegistrationRequstEntity,
    trx: PoolConnection,
  ): Promise<InstitutionRegistrationRequstEntity> {
    const institutionRegistrationRequestSQL = `
      INSERT INTO institution_registration_request(institution_id, institution_name, institution_logo_url, institution_email, institution_founding_year, institution_eiin_number, institution_location, institution_type) 
      VALUES (?,?,?,?,?,?,?,?)
    `;

    await trx.execute<ResultSetHeader>(institutionRegistrationRequestSQL, [
      institutionRegistrationRequest.institution_id,
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
  }
}
