import crypto from "crypto";
import { executeTransaction } from "@config/dbConnect.js";
import { institutionRepository } from "@modules/institution/institution.repository.js";
import { InstitutionRegistrationRequstEntity } from "@modules/institution/institution.interface.js";
import checkRequiredFields from "@utils/checkRequiredFields.js";
import { AppError } from "@/utils/appError.js";

export class InstitutionServices {
  async createInstitutionRegistrationRequest(
    payload: InstitutionRegistrationRequstEntity,
  ): Promise<{
    institutionId: string;
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
        const generatedInstitutionId = crypto.randomUUID();

        const institutionRegistrationRequstEntity: InstitutionRegistrationRequstEntity =
          {
            institution_id: generatedInstitutionId,
            institution_name: payload.institution_name,
            institution_logo_url: payload.institution_logo_url,
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
          institutionId: generatedInstitutionId,
          success: true,
        };
      } catch (err) {
        throw new AppError(`Unexpected server error happend ${err}`, 500);
      }
    });
  }
}

export const institutionServices = new InstitutionServices();
