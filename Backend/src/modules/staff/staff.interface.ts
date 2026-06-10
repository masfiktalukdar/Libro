export interface StaffAccountEntity {
  staff_id: string;
  institution_member_id: string;
  staff_employee_id: string;
  about_staff: string;
  chamber_location: string;
  joining_date: Date;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
