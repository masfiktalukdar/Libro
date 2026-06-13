export type Gender = "male" | "female" | "others";

export interface UserEntity {
  user_id: string;
  full_name: string;
  user_email: string;
  user_phone: string;
  user_password_hashed: string;
  gender: Gender;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type RegesterUserDTO = Omit<
  UserEntity,
  "user_id" | "created_at" | "updated_at" | "deleted_at"
> & {
  user_plain_password: string;
};
export type SafeUserDTO = Omit<
  UserEntity,
  "user_password_hashed" | "deleted_at"
>;

export interface InstitutionMemberEntity {
  institution_member_id: string;
  institution_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

export type AddInstitutionMemberDTO = Pick<
  InstitutionMemberEntity,
  "institution_id" | "user_id"
>;

export interface RegisterInstitutionalUserDTO {
  full_name: string;
  user_email: string;
  user_phone: string;
  user_password_plaintext: string;
  gender: Gender;
  avatar_url?: string | null;

  institution_id: string;
  user_id: string;
  role: "student" | "staff";

  institution_member_id: string;
  department_id: string;
  shift_id: string;
  student_roll_no: string;
  student_registration_no: string;
  student_session: string;

  staff_employee_id: string;
  about_staff: string;
  chamber_location: string;
  joining_date: Date;
}
