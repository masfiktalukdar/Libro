import crypto from "crypto";
import bcrypt from "bcrypt";
import { executeTransaction } from "@config/dbConnect.js";
import { authRepository } from "@modules/auth/auth.repository.js";
import { studentAccountRepository } from "@modules/student/student.repository.js";
import { StudentAccountEntity } from "@modules/student/student.interface.js";
import { staffAccountRepository } from "@modules/staff/staff.repository.js";
import { StaffAccountEntity } from "@modules/staff/staff.interface.js";
import { AppError } from "@utils/appError.js";
import {
  UserEntity,
  InstitutionMemberEntity,
} from "@modules/auth/auth.interface.js";

export class AuthService {
  async registerInstitutionalUser(
    payload: any,
  ): Promise<{ memberId: string; userId: string; success: boolean }> {
    const regesteredUser = await authRepository.findUserByEmail(
      payload.user_email,
    );
    if (regesteredUser)
      throw new AppError("User with this email already exists", 400);

    const saltedRounds = 20;
    const hashedPassword = await bcrypt.hash(
      payload.user_password_plaintext,
      saltedRounds,
    );

    return await executeTransaction(async (trxConnection) => {
      const generatedUserId = crypto.randomUUID();
      const generatedMemberId = crypto.randomUUID();

      const userEntity: UserEntity = {
        user_id: generatedUserId,
        full_name: payload.full_name,
        user_password_hashed: payload.user_password_hashed,
        user_email: payload.user_email,
        user_phone: payload.user_phone,
        gender: payload.gender,
        avatar_url: payload.avatar_url || null,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      await authRepository.createUser(userEntity, trxConnection);

      const institutionMemberEntity: InstitutionMemberEntity = {
        institution_member_id: generatedMemberId,
        institution_id: payload.institution_id,
        user_id: payload.user_id,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
      };

      await authRepository.createInstitutionMember(
        institutionMemberEntity,
        trxConnection,
      );

      if (payload.role == "student") {
        const generatedStudentId = crypto.randomUUID();
        const studentAccountEntity: StudentAccountEntity = {
          student_id: generatedStudentId,
          institution_member_id: payload.institution_member_id,
          department_id: payload.department_id,
          shift_id: payload.shift_id,
          student_roll_no: payload.student_roll_no,
          student_registration_no: payload.student_registration_no,
          student_session: payload.student_session,
          account_status: "active",
          reputation_score: "5.00",
          has_library_clarence: true,
          total_fine_amount: "0.00",
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: new Date(),
        };

        await studentAccountRepository.createStudentAccount(
          studentAccountEntity,
          trxConnection,
        );
      } else if (payload.role == "staff") {
        const generatedStaffId = crypto.randomUUID();
        const staffAccountEntity: StaffAccountEntity = {
          staff_id: generatedStaffId,
          institution_member_id: payload.institution_member_id,
          staff_employee_id: payload.staff_employee_id,
          about_staff: payload.about_staff,
          chamber_location: payload.chamber_location,
          joining_date: payload.joining_date,
          created_at: new Date(),
          updated_at: new Date(),
          deleted_at: null,
        };

        await staffAccountRepository.createStuffAccount(
          staffAccountEntity,
          trxConnection,
        );
      } else {
        throw new AppError(
          `Invalid institutional role format provided: ${payload.role}`,
          400,
        );
      }

      return {
        userId: generatedUserId,
        memberId: generatedMemberId,
        success: true,
      };
    });
  }
}
