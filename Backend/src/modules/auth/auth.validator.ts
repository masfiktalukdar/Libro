import { z } from "zod";
import sanitizeHtml from "sanitize-html";

// Helpers

const sanitize = (value: string): string =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });

const safeText = (min: number, max: number, errorMessage?: string) =>
  z
    .string()
    .trim()
    .min(min, {
      error: errorMessage ?? `Must contain at least ${min} characters`,
    })
    .max(max, {
      error: `Cannot exceed ${max} characters`,
    })
    .transform(sanitize);

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z.email({
      error: "Invalid email address",
    }),
  );

const uuidSchema = z.uuid();

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+8801|01)[3-9]\d{8}$/, {
    error: "Invalid Bangladeshi phone number",
  });

const avatarUrlSchema = z
  .string()
  .trim()
  .pipe(
    z.url({
      error: "Invalid URL",
    }),
  )
  .nullable()
  .optional();

// Enums

export const genderSchema = z.enum(["male", "female", "other"]);

// Shared Fields

const baseInstitutionUserSchema = z.object({
  full_name: safeText(3, 255, "Full name must be at least 3 characters"),

  user_email: emailSchema,

  user_phone: phoneSchema,

  user_password_plaintext: z
    .string()
    .min(8, {
      error: "Password must contain at least 8 characters",
    })
    .max(100, {
      error: "Password cannot exceed 100 characters",
    }),

  gender: genderSchema,

  avatar_url: avatarUrlSchema,

  institution_id: uuidSchema,

  user_id: uuidSchema,

  institution_member_id: safeText(1, 100, "Institution member ID is required"),
});

// Student Registration

const studentSchema = baseInstitutionUserSchema.extend({
  role: z.literal("student"),

  department_id: uuidSchema,

  shift_id: uuidSchema,

  student_roll_no: safeText(1, 50, "Student roll number is required"),

  student_registration_no: safeText(
    1,
    50,
    "Student registration number is required",
  ),

  student_session: safeText(1, 20, "Student session is required"),
});

// Staff Registration

const staffSchema = baseInstitutionUserSchema.extend({
  role: z.literal("staff"),

  department_id: uuidSchema,

  shift_id: uuidSchema,

  staff_employee_id: safeText(1, 50, "Employee ID is required"),

  about_staff: safeText(0, 5000, "About staff is too long"),

  chamber_location: safeText(1, 255, "Chamber location is required"),

  joining_date: z.coerce.date(),
});

// Main schema

export const registerInstitutionalUserSchema = z.discriminatedUnion("role", [
  studentSchema,
  staffSchema,
]);

//Types

export type RegisterInstitutionalUserPayload = z.infer<
  typeof registerInstitutionalUserSchema
>;

export type StudentRegistrationPayload = z.infer<typeof studentSchema>;

export type StaffRegistrationPayload = z.infer<typeof staffSchema>;
