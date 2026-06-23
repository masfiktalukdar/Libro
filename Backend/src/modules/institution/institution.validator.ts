import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const institutionTypeSchema = z.enum(["university", "polytechnic"]);

export const studentApprovalSystemSchema = z.enum(["manual", "automatic"]);

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
export const institutionRegistrationSchema = z.object({
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
});

// Schema for creating actual institution
export const institutionCreationSchema = z.object({
  institution_name: cleanString.min(2).max(255).transform(sanitize),

  institution_short_form: cleanString
    .min(2)
    .max(10)
    .transform((v) => v.toUpperCase()),

  institution_logo_url: z.string().trim().pipe(z.url()).nullable(),

  institution_password_text: z.string().min(20).max(255).nullable(),

  student_approval_system: studentApprovalSystemSchema,

  membership_fee_type: membershipFeeTypeSchema,

  membership_fee_amount: z.number().nonnegative(),

  student_book_borrow_limit: z.int().positive(),

  student_fine_limit_amount: z.number().nonnegative(),

  reservation_expiry_in_minutes: z.int().positive(),

  library_opening_time: z.iso.time(),

  library_closing_time: z.iso.time(),
});

// exporting and infering the types
export type InstitutionRegistrationInput = z.infer<
  typeof institutionRegistrationSchema
>;
export type InstitutionCreationInput = z.infer<
  typeof institutionCreationSchema
>;
