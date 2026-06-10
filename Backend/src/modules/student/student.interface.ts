export type AccountStatus = "active" | "flagged" | "banned";

export interface StudentAccountEntity {
  student_id: string;
  institution_member_id: string;
  department_id: string;
  shift_id: string;
  student_roll_no: string;
  student_registration_no: string;
  student_session: string;
  account_status: AccountStatus;
  reputation_score: string;
  has_library_clarence: boolean;
  total_fine_amount: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
