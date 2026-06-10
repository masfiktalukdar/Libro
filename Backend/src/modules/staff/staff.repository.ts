import { dbPool } from "@config/dbConnect.js";
import { StaffAccountEntity } from "@modules/staff/staff.interface.js";
import { ResultSetHeader } from "mysql2";

export class StaffAccountRepository {
  async createStuffAccount(
    staff: StaffAccountEntity,
  ): Promise<StaffAccountEntity> {
    const createStuffAccountSQL = `
      INSERT INTO staff_profile(staff_id,institution_member_id,staff_employee_id,about_staff,chamber_location,joining_date) 
      VALUES(?,?,?,?,?,?)
    `;

    await dbPool.execute<ResultSetHeader>(createStuffAccountSQL, [
      staff.staff_id,
      staff.institution_member_id,
      staff.staff_employee_id,
      staff.about_staff,
      staff.chamber_location,
      staff.joining_date,
    ]);

    return staff;
  }
}
