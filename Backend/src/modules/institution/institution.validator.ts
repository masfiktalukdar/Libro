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

export const institutionRegistrationRequestStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
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

// Schema for full institution entity in database
export const institutionEntitySchema = institutionCreationSchema
  .omit({ institution_password_text: true, institution_logo_url: true })
  .extend(
    institutionRegistrationRequestSchema.omit({
      otp: true,
      institution_logo_url: true,
    }).shape,
  )
  .extend({
    institution_id: z.uuid(),
    institution_slug: cleanString.min(2).max(200),
    institution_logo_url: z.string().nullable(),
    institution_password_text: z.string().optional(),
    institution_password_hashed: z.string().max(255),
    created_at: z.union([z.date(), z.string()]),
    updated_at: z.union([z.date(), z.string()]),
    deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
  });

// Schema for institution registration request entity in database
export const institutionRegistrationRequestEntitySchema =
  institutionRegistrationRequestSchema
    .omit({ otp: true, institution_logo_url: true })
    .extend({
      institution_request_id: z.uuid(),
      institution_logo_url: z.string().nullable(),
      registration_request_status: institutionRegistrationRequestStatusSchema,
      created_at: z.union([z.date(), z.string()]),
      updated_at: z.union([z.date(), z.string()]),
      deleted_at: z.union([z.date(), z.string()]).nullable().optional(),
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

// Schema for institution shift

export const institutionShiftSchema = z.object({
  shift_id: z.uuid(),
  institution_id: z.uuid(),
  shift_name: cleanString
    .min(2, "Department name must be at least 2 characters long")
    .max(100)
    .transform(sanitize),
  shift_start_time: z.iso.time(),
  shift_end_time: z.iso.time(),
});

// Schema for institution holidays

export const institutionHolidaysSchema = z.object({
  institution_holidays_id: z.uuid(),
  institution_id: z.uuid(),
  holiday_type: z.enum(["recurring", "manual"]),
  holiday_value: cleanString
    .max(50, "Holiday value must be under 50 charecters")
    .transform(sanitize),
});

export const recurringDaySchema = z.enum([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

// Schema for adding recurring holiday(s) - e.g. weekly off-days like Friday, Saturday
export const addRecurringHolidaySchema = z
  .object({
    institution_id: z.uuid(),
    day: recurringDaySchema.optional(),
    day_of_week: recurringDaySchema.optional(),
    days: z.array(recurringDaySchema).min(1).optional(),
    days_of_week: z.array(recurringDaySchema).min(1).optional(),
  })
  .refine(
    (data) =>
      Boolean(data.day || data.day_of_week) ||
      (Array.isArray(data.days) && data.days.length > 0) ||
      (Array.isArray(data.days_of_week) && data.days_of_week.length > 0),
    {
      message:
        "Please provide recurring day(s), e.g. 'day' or 'days' with valid weekday name(s)",
    },
  );

// Schema for adding manual holiday (single date or date range)
export const addManualHolidaySchema = z
  .object({
    institution_id: z.uuid(),
    date: z.iso.date().optional(),
    start_date: z.iso.date().optional(),
    end_date: z.iso.date().optional(),
  })
  .refine((data) => Boolean(data.date || data.start_date), {
    message: "Please provide either 'date' or 'start_date' in YYYY-MM-DD format",
  })
  .refine(
    (data) => {
      const sDate = data.start_date || data.date;
      const eDate = data.end_date;
      if (sDate && eDate) {
        return sDate <= eDate;
      }
      return true;
    },
    {
      message: "start_date must be less than or equal to end_date",
      path: ["end_date"],
    },
  );

// Schema for deleting institution holiday
export const deleteInstitutionHolidaySchema = z.object({
  institution_id: z.uuid(),
  institution_holidays_id: z.uuid(),
});

// Schema for querying institution holidays
export const getInstitutionHolidaysQuerySchema = z.object({
  institution_id: z.uuid(),
  holiday_type: z.enum(["recurring", "manual"]).optional(),
});

// Schema for file asset in institution

export const fileAssetSchema = z.object({
  asset_id: z.uuid(),
  institution_id: z.uuid(),
  file_url: z.url().max(1024),
  file_type: z.enum(["pdf", "image"]),
  asset_scope: z
    .enum(["system_template", "tenant_private"])
    .default("tenant_private"),
});

// Schema for automatic registration keyword in any instution

export const automaticRegistrationKeywordSchema = z.object({
  keyword_id: z.uuid(),
  institution_id: z.uuid(),
  keyword_value: cleanString.min(1).max(100).transform(sanitize),
});

// * exporting and infering the types from schemas
export type InstitutionType = z.infer<typeof institutionTypeSchema>;
export type StudentApprovalSystem = z.infer<
  typeof studentApprovalSystemSchema
>;
export type MembershipFeeType = z.infer<typeof membershipFeeTypeSchema>;
export type InstitutionRegistrationRequestStatus = z.infer<
  typeof institutionRegistrationRequestStatusSchema
>;

export type InstitutionRegistrationInput = z.infer<
  typeof institutionRegistrationRequestSchema
>;
export type InstitutionCreationInput = z.infer<
  typeof institutionCreationSchema
>;

export type InstitutionEntity = z.infer<typeof institutionEntitySchema>;
export type InstitutionRegistrationRequstEntity = z.infer<
  typeof institutionRegistrationRequestEntitySchema
>;
export type InstitutionRegistrationRequstPayload = InstitutionEntity;

export type DepartmentEntity = z.infer<typeof institutionDepartmentSchema>;

export type InstitutionShiftEntity = z.infer<typeof institutionShiftSchema>;

export type InstitutionHolidaysEntity = z.infer<
  typeof institutionHolidaysSchema
>;
export type InstitutionHolidayEntity = InstitutionHolidaysEntity;
export type HolidayType = InstitutionHolidaysEntity["holiday_type"];

export type AddRecurringHolidayInput = z.infer<
  typeof addRecurringHolidaySchema
>;

export type AddManualHolidayInput = z.infer<typeof addManualHolidaySchema>;

export type DeleteInstitutionHolidayInput = z.infer<
  typeof deleteInstitutionHolidaySchema
>;

export type GetInstitutionHolidaysQueryInput = z.infer<
  typeof getInstitutionHolidaysQuerySchema
>;

export type FileAssetEntithy = z.infer<typeof fileAssetSchema>;

export type AutomaticRegistrationKeywordEntity = z.infer<
  typeof automaticRegistrationKeywordSchema
>;

