import { dbPool } from "@config/dbConnect.js";
import {
  UserEntity,
  InstitutionMemberEntity,
} from "@modules/auth/auth.interface.js";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { PoolConnection } from "mysql2/promise";

export class AuthRepository {
  async createUser(user: UserEntity, trx: PoolConnection): Promise<UserEntity> {
    const createUserSQL = `
      INSERT INTO user(user_id, full_name, user_email, user_phone, user_password_hashed, gender, avatar_url) VALUES (?,?,?,?,?,?,?)
    `;
    await trx.execute<ResultSetHeader>(createUserSQL, [
      user.user_id,
      user.full_name,
      user.user_email,
      user.user_phone,
      user.user_password_hashed,
      user.gender,
      user.avatar_url,
    ]);

    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    if (!email || email.trim().length === 0) return null;

    const normalized = email.toLocaleLowerCase().trim();
    const findEmailSQL = `
      SELECT * FROM 
      user WHERE user_email = ? AND deleted_at IS NULL 
      LIMIT 1
    `;

    const [emails] = await dbPool.execute<RowDataPacket[]>(findEmailSQL, [
      normalized,
    ]);

    return (emails[0] as UserEntity) || null;
  }

  async createInstitutionMember(
    institutionMember: InstitutionMemberEntity,
    trx: PoolConnection,
  ): Promise<InstitutionMemberEntity> {
    const createInstitutionMemberSQL = `
      INSERT INTO institution_member (institution_member_id, institution_id, user_id) 
      VALUES(?,?,?)
    `;

    await trx.execute(createInstitutionMemberSQL, [
      institutionMember.institution_member_id,
      institutionMember.institution_id,
      institutionMember.user_id,
    ]);

    return institutionMember;
  }
}

export const authRepository = new AuthRepository();
