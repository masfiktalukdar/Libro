export type InstitutionType = "university" | "polytechnic";
export type StudentApprovalSystem = "manual" | "automatic";
export type MembershipFeeType =
  | "none"
  | "per_month"
  | "per_semester"
  | "per_year";
export type InstitutionRegistrationRequestStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface InstitutionEntity {
  institution_id: string;
  institution_name: string;
  institution_short_form: string;
  institution_slug: string;
  institution_logo_url: string | null;
  institution_email: string;
  institution_founding_year: number;
  institution_eiin_number: string;
  institution_location: string;
  institution_type: InstitutionType;
  student_approval_system: StudentApprovalSystem;
  membership_fee_type: MembershipFeeType;
  membership_fee_amount: number;
  student_book_borrow_limit: number;
  student_fine_limit_amount: number;
  reservation_expiry_in_minutes: number;
  library_opening_time: string;
  library_closing_time: string;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
}

export type InstitutionRegistrationRequstEntity = Omit<
  InstitutionEntity,
  | "institution_id"
  | "institution_short_form"
  | "institution_slug"
  | "student_approval_system"
  | "membership_fee_amount"
  | "membership_fee_type"
  | "student_book_borrow_limit"
  | "student_fine_limit_amount"
  | "reservation_expiry_in_minutes"
  | "reservation_expiry_in_minutes"
  | "library_opening_time"
  | "library_closing_time"
> & {
  registration_request_status: InstitutionRegistrationRequestStatus;
  institution_request_id: string;
};

export type InstitutionRegistrationRequstPayload = InstitutionEntity;
