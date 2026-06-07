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
