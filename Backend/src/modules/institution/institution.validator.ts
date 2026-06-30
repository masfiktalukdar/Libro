import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const institutionTypeSchema = z.enum(["university", "polytechnic"]);

export const studentApprovalSystemSchema = z.enum(["manual", "automatic"]);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export const membershipFeeTypeSchema = z.enum([
  "none",
  "per_month",
  "per_semester",
  "per_year",
]);

const sanitize = (value: string) =>
  sanitizeHtml(value, {
    allowedTags: [],
    allowedAttributes: {},
  });

const cleanString = z.string().trim();

// Schema for registration request
export const institutionRegistrationRequestSchema = z.object({
  institution_name: cleanString
    .min(2, "Institution name must be at least 2 characters")
    .max(255)
    .transform(sanitize),

  institution_email: z.email("Invalid email address"),

  institution_founding_year: z
    .number()
    .int()
    .min(1000)
    .max(new Date().getFullYear()),

  institution_eiin_number: cleanString
    .regex(/^\d+$/, "EIIN number must contain only numeric digits")
    .max(20, "EIIN number cannot exceed 20 characters"),

  institution_location: cleanString
    .min(5, "Location details are too short")
    .max(250)
    .transform(sanitize),

  institution_type: institutionTypeSchema,

  institution_logo_url: z.url("Invalid logo URL format").nullable().optional(),

  otp: cleanString
    .regex(/^\d+$/, "OTP number must contain only numeric digits")
    .length(6, "OTP should be 6 characters")
    .transform(sanitize),
});

// Schema for registration request otp send
export const institutionRegistrationOTP =
  institutionRegistrationRequestSchema.omit({
    otp: true,
  });

// Schema for creating actual institution
export const institutionCreationSchema = z.object({
  institution_name: cleanString.min(2).max(255).transform(sanitize),

  institution_short_form: cleanString
    .min(2)
    .max(10)
    .transform((v) => v.toUpperCase()),

  institution_logo_url: z.string().trim().pipe(z.url()).nullable(),

  institution_password_text: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(255, "Password is too long")
    .regex(
      passwordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),

  student_approval_system: studentApprovalSystemSchema,

  membership_fee_type: membershipFeeTypeSchema,

  membership_fee_amount: z.number().nonnegative(),

  student_book_borrow_limit: z.int().positive(),

  student_fine_limit_amount: z.number().nonnegative(),

  reservation_expiry_in_minutes: z.int().positive(),

  library_opening_time: z.iso.time(),

  library_closing_time: z.iso.time(),
});

export const institutionSchema = institutionCreationSchema
  .extend(institutionRegistrationRequestSchema.shape)
  .extend({
    department_id: z.uuid(),
    institution_id: z.uuid(),
  });

// Schema for institution department
export const institutionDepartmentSchema = z.object({
  department_id: z.uuid(),
  institution_id: z.uuid(),
  department_name: cleanString
    .min(2, "Department name must be at least 2 characters long")
    .max(255)
    .transform(sanitize),
});

// * exporting and infering the types
export type InstitutionRegistrationInput = z.infer<
  typeof institutionRegistrationRequestSchema
>;
export type InstitutionCreationInput = z.infer<
  typeof institutionCreationSchema
>;

export type DepartmentEntity = z.infer<typeof institutionDepartmentSchema>;
