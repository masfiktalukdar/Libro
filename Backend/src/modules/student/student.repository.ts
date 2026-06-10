import { dbPool } from "@config/dbConnect.js";
import { StudentProfileEntity } from "@modules/student/student.interface.js";
import { ResultSetHeader } from "mysql2";

export class StudentAccountRepository {
  async createStudentAccount(
    student: StudentProfileEntity,
  ): Promise<StudentProfileEntity> {
    const createStudentAccountSQL = `
      INSERT INTO student_profile(student_id,institution_member_id,department_id,shift_id,student_roll_no,student_registration_no,student_session,account_status,reputation_score,has_library_clarence,total_fine_amount) 
      VALUES(?,?,?,?,?,?,?,?,?,?,?)
    `;

    await dbPool.execute<ResultSetHeader>(createStudentAccountSQL, [
      student.student_id,
      student.institution_member_id,
      student.department_id,
      student.shift_id,
      student.student_roll_no,
      student.student_registration_no,
      student.student_session,
      student.account_status,
      student.reputation_score,
      student.has_library_clarence,
      student.total_fine_amount,
    ]);

    return student;
  }
}

export const studentAccountrepository = new StudentAccountRepository();
