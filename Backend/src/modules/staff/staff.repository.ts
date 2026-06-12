import { PoolConnection } from "mysql2/promise";
import { StaffAccountEntity } from "@modules/staff/staff.interface.js";
import { Pool, ResultSetHeader } from "mysql2";

export class StaffAccountRepository {
  async createStuffAccount(
    staff: StaffAccountEntity,
    trx: PoolConnection,
  ): Promise<StaffAccountEntity> {
    const createStuffAccountSQL = `
      INSERT INTO staff_profile(staff_id,institution_member_id,staff_employee_id,about_staff,chamber_location,joining_date) 
      VALUES(?,?,?,?,?,?)
    `;

    await trx.execute<ResultSetHeader>(createStuffAccountSQL, [
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

export const staffAccountRepository = new StaffAccountRepository();
