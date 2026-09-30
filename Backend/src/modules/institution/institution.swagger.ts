export const institutionSwaggerSchemas = {
  // Common Enums

  InstitutionTypeEnum: {
    type: "string",
    enum: ["university", "polytechnic"],
    example: "polytechnic",
  },

  StudentApprovalSystemEnum: {
    type: "string",
    enum: ["manual", "automatic"],
    example: "manual",
  },

  MembershipFeeTypeEnum: {
    type: "string",
    enum: ["none", "per_month", "per_semester", "per_year"],
    example: "per_semester",
  },

  RegistrationRequestStatusEnum: {
    type: "string",
    enum: ["pending", "approved", "rejected"],
    example: "pending",
  },

  RecurringWeekdayEnum: {
    type: "string",
    enum: [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ],
    example: "friday",
  },

  HolidayTypeEnum: {
    type: "string",
    enum: ["recurring", "manual"],
    example: "manual",
  },

  FileAssetScopeEnum: {
    type: "string",
    enum: ["system_template", "tenant_private"],
    example: "tenant_private",
  },

  FileAssetTypeEnum: {
    type: "string",
    enum: ["pdf", "image"],
    example: "pdf",
  },

  // Section 1: Onboarding & Registration Requests Schemas

  InstitutionRegistrationOTPDto: {
    type: "object",
    properties: {
      institution_name: {
        type: "string",
        minLength: 2,
        maxLength: 255,
        example: "Mymensingh Polytechnic Institute",
      },
      institution_email: {
        type: "string",
        format: "email",
        example: "info@mpi.edu.bd",
      },
      institution_founding_year: {
        type: "integer",
        minimum: 1000,
        example: 1963,
      },
      institution_eiin_number: {
        type: "string",
        pattern: "^\\d+$",
        maxLength: 20,
        example: "132456",
      },
      institution_location: {
        type: "string",
        minLength: 5,
        maxLength: 250,
        example: "Maskanda, Mymensingh, Bangladesh",
      },
      institution_type: {
        $ref: "#/components/schemas/InstitutionTypeEnum",
      },
      institution_logo_url: {
        type: "string",
        format: "uri",
        nullable: true,
        example: "https://example.com/logo.png",
      },
    },
    required: [
      "institution_name",
      "institution_email",
      "institution_founding_year",
      "institution_eiin_number",
      "institution_location",
      "institution_type",
    ],
  },

  InstitutionRegistrationRequestDto: {
    allOf: [
      { $ref: "#/components/schemas/InstitutionRegistrationOTPDto" },
      {
        type: "object",
        properties: {
          otp: {
            type: "string",
            pattern: "^\\d{6}$",
            example: "123456",
            description: "6-digit OTP code sent to the institution email",
          },
        },
        required: ["otp"],
      },
    ],
  },

  InstitutionCreationDto: {
    type: "object",
    properties: {
      institution_name: {
        type: "string",
        minLength: 2,
        maxLength: 255,
        example: "Mymensingh Polytechnic Institute",
      },
      institution_short_form: {
        type: "string",
        minLength: 2,
        maxLength: 10,
        example: "MPI",
      },
      institution_logo_url: {
        type: "string",
        format: "uri",
        nullable: true,
        example: "https://example.com/logo.png",
      },
      institution_password_text: {
        type: "string",
        minLength: 8,
        maxLength: 255,
        example: "AdminSecure@2026",
        description:
          "Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character",
      },
      student_approval_system: {
        $ref: "#/components/schemas/StudentApprovalSystemEnum",
      },
      membership_fee_type: {
        $ref: "#/components/schemas/MembershipFeeTypeEnum",
      },
      membership_fee_amount: {
        type: "number",
        minimum: 0,
        example: 50.0,
      },
      student_book_borrow_limit: {
        type: "integer",
        minimum: 1,
        example: 3,
      },
      student_fine_limit_amount: {
        type: "number",
        minimum: 0,
        example: 100.0,
      },
      reservation_expiry_in_minutes: {
        type: "integer",
        minimum: 1,
        example: 1440,
        description: "Minutes before an uncollected reservation expires",
      },
      library_opening_time: {
        type: "string",
        pattern: "^\\d{2}:\\d{2}(:\\d{2})?$",
        example: "09:00:00",
      },
      library_closing_time: {
        type: "string",
        pattern: "^\\d{2}:\\d{2}(:\\d{2})?$",
        example: "17:00:00",
      },
    },
    required: [
      "institution_name",
      "institution_short_form",
      "institution_password_text",
      "student_approval_system",
      "membership_fee_type",
      "membership_fee_amount",
      "student_book_borrow_limit",
      "student_fine_limit_amount",
      "reservation_expiry_in_minutes",
      "library_opening_time",
      "library_closing_time",
    ],
  },

  InstitutionRegistrationRequestEntityDto: {
    type: "object",
    properties: {
      institution_request_id: {
        type: "string",
        format: "uuid",
        example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      },
      institution_name: {
        type: "string",
        example: "Mymensingh Polytechnic Institute",
      },
      institution_logo_url: {
        type: "string",
        nullable: true,
        example: "https://example.com/logo.png",
      },
      institution_email: {
        type: "string",
        format: "email",
        example: "info@mpi.edu.bd",
      },
      institution_founding_year: {
        type: "integer",
        example: 1963,
      },
      institution_eiin_number: {
        type: "string",
        example: "132456",
      },
      institution_location: {
        type: "string",
        example: "Maskanda, Mymensingh",
      },
      institution_type: {
        $ref: "#/components/schemas/InstitutionTypeEnum",
      },
      registration_request_status: {
        $ref: "#/components/schemas/RegistrationRequestStatusEnum",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
    },
  },

  // Section 2: Institution Profile & Settings Schemas

  InstitutionEntityDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      institution_name: {
        type: "string",
        example: "Mymensingh Polytechnic Institute",
      },
      institution_short_form: {
        type: "string",
        example: "MPI",
      },
      institution_slug: {
        type: "string",
        example: "mymensingh-polytechnic-institute",
      },
      institution_logo_url: {
        type: "string",
        nullable: true,
        example: "https://example.com/logo.png",
      },
      institution_email: {
        type: "string",
        format: "email",
        example: "info@mpi.edu.bd",
      },
      institution_founding_year: {
        type: "integer",
        example: 1963,
      },
      institution_eiin_number: {
        type: "string",
        example: "132456",
      },
      institution_location: {
        type: "string",
        example: "Maskanda, Mymensingh",
      },
      institution_type: {
        $ref: "#/components/schemas/InstitutionTypeEnum",
      },
      student_approval_system: {
        $ref: "#/components/schemas/StudentApprovalSystemEnum",
      },
      membership_fee_type: {
        $ref: "#/components/schemas/MembershipFeeTypeEnum",
      },
      membership_fee_amount: {
        type: "number",
        example: 50.0,
      },
      student_book_borrow_limit: {
        type: "integer",
        example: 3,
      },
      student_fine_limit_amount: {
        type: "number",
        example: 100.0,
      },
      reservation_expiry_in_minutes: {
        type: "integer",
        example: 1440,
      },
      library_opening_time: {
        type: "string",
        example: "09:00:00",
      },
      library_closing_time: {
        type: "string",
        example: "17:00:00",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
    },
  },

  EditInstitutionNameDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      institution_name: {
        type: "string",
        minLength: 2,
        maxLength: 255,
        example: "Mymensingh Central Polytechnic Institute",
      },
    },
    required: ["institution_id", "institution_name"],
  },

  UpdateInstitutionGeneralFieldsDto: {
    type: "object",
    properties: {
      institution_short_form: {
        type: "string",
        example: "MPI",
      },
      institution_logo_url: {
        type: "string",
        format: "uri",
        nullable: true,
        example: "https://example.com/new-logo.png",
      },
      institution_founding_year: {
        type: "integer",
        example: 1963,
      },
      institution_location: {
        type: "string",
        example: "New Campus, Mymensingh",
      },
      student_approval_system: {
        $ref: "#/components/schemas/StudentApprovalSystemEnum",
      },
      membership_fee_type: {
        $ref: "#/components/schemas/MembershipFeeTypeEnum",
      },
      membership_fee_amount: {
        type: "number",
        example: 75.0,
      },
      student_book_borrow_limit: {
        type: "integer",
        example: 4,
      },
      student_fine_limit_amount: {
        type: "number",
        example: 150.0,
      },
      reservation_expiry_in_minutes: {
        type: "integer",
        example: 2880,
      },
      library_opening_time: {
        type: "string",
        example: "08:30:00",
      },
      library_closing_time: {
        type: "string",
        example: "18:00:00",
      },
    },
  },

  UpdateInstitutionSensitiveFieldsDto: {
    type: "object",
    properties: {
      institution_password_text: {
        type: "string",
        description: "Current password of the institution administrator",
        example: "OldPassword@123",
      },
      institution_email: {
        type: "string",
        format: "email",
        description: "New official email address for the institution",
        example: "principal@mpi.edu.bd",
      },
      new_password_plaintext: {
        type: "string",
        description: "New password (at least 8 characters with upper, lower, number, special)",
        example: "BrandNewSecret@2026",
      },
    },
    required: ["institution_password_text"],
  },

  // Section 3: Academic Department Schemas

  CreateDepartmentDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      department_name: {
        type: "string",
        minLength: 2,
        maxLength: 255,
        example: "Computer Science and Technology",
      },
    },
    required: ["institution_id", "department_name"],
  },

  DepartmentEntityDto: {
    type: "object",
    properties: {
      department_id: {
        type: "string",
        format: "uuid",
        example: "f2c06950-8b21-4f10-9b0d-45db6e118944",
      },
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      department_name: {
        type: "string",
        example: "Computer Science and Technology",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
    },
  },

  // Section 4: Academic Shift Schemas

  CreateShiftDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      shift_name: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        example: "1st Shift (Morning)",
      },
      shift_start_time: {
        type: "string",
        example: "08:00:00",
      },
      shift_end_time: {
        type: "string",
        example: "13:30:00",
      },
    },
    required: [
      "institution_id",
      "shift_name",
      "shift_start_time",
      "shift_end_time",
    ],
  },

  UpdateShiftDto: {
    type: "object",
    properties: {
      shift_name: {
        type: "string",
        example: "1st Shift (Morning)",
      },
      shift_start_time: {
        type: "string",
        example: "08:00:00",
      },
      shift_end_time: {
        type: "string",
        example: "13:30:00",
      },
    },
    required: ["shift_name", "shift_start_time", "shift_end_time"],
  },

  ShiftEntityDto: {
    type: "object",
    properties: {
      shift_id: {
        type: "string",
        format: "uuid",
        example: "d1a89c20-3b4e-4f5a-8b1c-901234567890",
      },
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      shift_name: {
        type: "string",
        example: "1st Shift (Morning)",
      },
      shift_start_time: {
        type: "string",
        example: "08:00:00",
      },
      shift_end_time: {
        type: "string",
        example: "13:30:00",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
    },
  },

  // Section 5: Document Assets & Verification Examples Schemas

  AddFileAssetDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      file_url: {
        type: "string",
        format: "uri",
        maxLength: 1024,
        example: "https://example.com/student-id-card-sample.pdf",
      },
      file_type: {
        $ref: "#/components/schemas/FileAssetTypeEnum",
      },
      asset_scope: {
        $ref: "#/components/schemas/FileAssetScopeEnum",
        default: "tenant_private",
      },
    },
    required: ["institution_id", "file_url", "file_type"],
  },

  FileAssetEntityDto: {
    type: "object",
    properties: {
      asset_id: {
        type: "string",
        format: "uuid",
        example: "a8e94b23-6c8f-4e01-9a74-123456789abc",
      },
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      file_url: {
        type: "string",
        format: "uri",
        example: "https://example.com/student-id-card-sample.pdf",
      },
      file_type: {
        $ref: "#/components/schemas/FileAssetTypeEnum",
      },
      asset_scope: {
        $ref: "#/components/schemas/FileAssetScopeEnum",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
    },
  },

  // Section 6: Registration Automation Keyword Schemas

  AddAutomaticRegistrationKeywordDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      keyword_value: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        example: "polytechnic",
      },
    },
    required: ["institution_id", "keyword_value"],
  },

  AutomaticRegistrationKeywordEntityDto: {
    type: "object",
    properties: {
      keyword_id: {
        type: "string",
        format: "uuid",
        example: "7e8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c",
      },
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      keyword_value: {
        type: "string",
        example: "polytechnic",
      },
      created_at: {
        type: "string",
        format: "date-time",
      },
      updated_at: {
        type: "string",
        format: "date-time",
      },
    },
  },

  // Section 7: Holidays & Calendar Schemas

  AddRecurringHolidayDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      day: {
        $ref: "#/components/schemas/RecurringWeekdayEnum",
        description: "Single recurring off-day (e.g. friday)",
      },
      days: {
        type: "array",
        items: {
          $ref: "#/components/schemas/RecurringWeekdayEnum",
        },
        description: "Multiple recurring off-days",
        example: ["friday", "saturday"],
      },
    },
    required: ["institution_id"],
    description: "Provide either 'day' or 'days' with valid weekday name(s)",
  },

  AddManualHolidayDto: {
    type: "object",
    properties: {
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      date: {
        type: "string",
        format: "date",
        example: "2026-10-15",
        description: "Single particular date (YYYY-MM-DD)",
      },
      start_date: {
        type: "string",
        format: "date",
        example: "2026-10-15",
        description: "Starting date of the holiday range (YYYY-MM-DD)",
      },
      end_date: {
        type: "string",
        format: "date",
        example: "2026-10-20",
        description: "Ending date of the holiday range (inclusive, YYYY-MM-DD)",
      },
    },
    required: ["institution_id"],
    description:
      "Provide either 'date' or 'start_date' (with optional 'end_date' for a date range)",
  },

  InstitutionHolidayDto: {
    type: "object",
    properties: {
      institution_holidays_id: {
        type: "string",
        format: "uuid",
        example: "550e8400-e29b-41d4-a716-446655440000",
      },
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      holiday_type: {
        $ref: "#/components/schemas/HolidayTypeEnum",
      },
      holiday_value: {
        type: "string",
        example: "friday",
        description: "Day name for recurring, or YYYY-MM-DD for manual holiday",
      },
    },
  },

};

export const institutionSwaggerPaths = {
  // Section 1: Onboarding & Registration Requests

  "/api/v1/institution/sent-registration-request-otp": {
    post: {
      tags: ["Institution - Onboarding & Registration"],
      summary: "Send OTP to verify institution email for registration request",
      description:
        "Sends a 6-digit OTP verification code to the institution's official email address.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/InstitutionRegistrationOTPDto",
            },
          },
        },
      },
      responses: {
        201: {
          description: "OTP sent successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationErrorResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/verify-registration-request-otp": {
    post: {
      tags: ["Institution - Onboarding & Registration"],
      summary: "Verify OTP and create institution registration application",
      description:
        "Verifies the received OTP and stores the pending institution registration request.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/InstitutionRegistrationRequestDto",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Registration request created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: {
                    type: "string",
                    example:
                      "Institution registration request has been created successfully",
                  },
                  data: {
                    type: "object",
                    properties: {
                      institutionRequestId: {
                        type: "string",
                        format: "uuid",
                      },
                      success: { type: "boolean", example: true },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Invalid or expired OTP",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/edit-registration-request": {
    patch: {
      tags: ["Institution - Onboarding & Registration"],
      summary: "Change institution registration request status (Admin)",
      security: [{ bearerAuth: [] }],
      description:
        "Approves or rejects an institution registration request.",
      parameters: [
        {
          name: "institution_request_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        },
        {
          name: "registration_request_status",
          in: "query",
          required: true,
          schema: {
            $ref: "#/components/schemas/RegistrationRequestStatusEnum",
          },
          example: "approved",
        },
      ],
      responses: {
        200: {
          description: "Status updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        400: {
          description: "Invalid request ID or status",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/sent-institution-creation-link": {
    post: {
      tags: ["Institution - Onboarding & Registration"],
      summary: "Generate and send institution initialization link",
      security: [{ bearerAuth: [] }],
      description:
        "Generates a 24-hour JWT token and registration link for an approved institution request.",
      parameters: [
        {
          name: "institution_request_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Invitation link generated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  registrationUrl: {
                    type: "string",
                    example:
                      "libro.com/institution-registration?id=...&token=...",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/get-registration-requests": {
    get: {
      tags: ["Institution - Onboarding & Registration"],
      summary: "List institution registration requests",
      security: [{ bearerAuth: [] }],
      description:
        "Fetches all institution registration requests with optional filtering by status or specific request ID.",
      parameters: [
        {
          name: "status",
          in: "query",
          required: false,
          schema: {
            $ref: "#/components/schemas/RegistrationRequestStatusEnum",
          },
          example: "pending",
        },
        {
          name: "institution_request_id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          example: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        },
      ],
      responses: {
        200: {
          description: "List of registration requests",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/InstitutionRegistrationRequestEntityDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/institution-creation": {
    post: {
      tags: ["Institution - Onboarding & Registration"],
      summary: "Finalize institution creation with library policies and settings",
      security: [{ bearerAuth: [] }],
      description:
        "Requires the institution registration token in the Bearer authorization header and the approved request ID in the query.",
      parameters: [
        {
          name: "id",
          in: "query",
          required: true,
          description: "The approved institution_request_id",
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/InstitutionCreationDto",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Institution created successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  data: {
                    $ref: "#/components/schemas/InstitutionEntityDto",
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid registration token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  // Section 2: Institution Profile & Settings

  "/api/v1/institution/get-institution-details": {
    get: {
      tags: ["Institution - Profile & Settings"],
      summary: "Get institution profile and configuration",
      security: [{ bearerAuth: [] }],
      description:
        "Fetches full institution profile and settings by institution ID or slug (excluding hashed passwords).",
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: false,
          schema: { type: "string", format: "uuid" },
          example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
        },
        {
          name: "institution_slug",
          in: "query",
          required: false,
          schema: { type: "string" },
          example: "mymensingh-polytechnic-institute",
        },
      ],
      responses: {
        200: {
          description: "Institution details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    $ref: "#/components/schemas/InstitutionEntityDto",
                  },
                },
              },
            },
          },
        },
        400: {
          description: "Missing required query parameters",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        404: {
          description: "Institution not found",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/edit-institution-name": {
    patch: {
      tags: ["Institution - Profile & Settings"],
      summary: "Rename an institution",
      security: [{ bearerAuth: [] }],
      description:
        "Updates the institution name and automatically recalculates its unique URL slug.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/EditInstitutionNameDto",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Name updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/update-institution-fields": {
    patch: {
      tags: ["Institution - Profile & Settings"],
      summary: "Update general profile and library settings fields",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateInstitutionGeneralFieldsDto",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Fields updated successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/update-institution-sensitive-fields": {
    patch: {
      tags: ["Institution - Profile & Settings"],
      summary: "Update sensitive credentials (email / password)",
      security: [{ bearerAuth: [] }],
      description:
        "Requires current institution password verification before changing email or password.",
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateInstitutionSensitiveFieldsDto",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Sensitive fields updated",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description:
            "Unauthorized - Missing or invalid Bearer token, or incorrect current password",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  // Section 3: Academic Departments

  "/api/v1/institution/get-institution-departments": {
    get: {
      tags: ["Institution - Departments"],
      summary: "Get all academic departments of an institution",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
        },
      ],
      responses: {
        200: {
          description: "Departments list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/DepartmentEntityDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        404: {
          description: "Invalid institution",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/create-institution-department": {
    post: {
      tags: ["Institution - Departments"],
      summary: "Create a new department under an institution",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateDepartmentDto",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Department created",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        403: {
          description: "Duplicate department name under this institution",
        },
      },
    },
  },

  "/api/v1/institution/delete-institution-department": {
    delete: {
      tags: ["Institution - Departments"],
      summary: "Delete a department",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "department_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Department deleted",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  // Section 4: Academic Shifts

  "/api/v1/institution/get-institution-shifts": {
    get: {
      tags: ["Institution - Shifts"],
      summary: "Get all shifts of an institution",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
        },
      ],
      responses: {
        200: {
          description: "Shifts list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/ShiftEntityDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        404: {
          description: "Invalid institution",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/create-institution-shift": {
    post: {
      tags: ["Institution - Shifts"],
      summary: "Create a shift (e.g. morning, day, evening)",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/CreateShiftDto",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Shift created",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        403: {
          description: "Shift timing overlap or duplicate shift name",
        },
      },
    },
  },

  "/api/v1/institution/update-institution-shift": {
    patch: {
      tags: ["Institution - Shifts"],
      summary: "Update shift name or timings",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "shift_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/UpdateShiftDto",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Shift updated",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/delete-institution-shift": {
    delete: {
      tags: ["Institution - Shifts"],
      summary: "Delete a shift",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "shift_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Shift deleted",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  // Section 5: Document Assets & Verification Examples

  "/api/v1/institution/get-institution-documents": {
    get: {
      tags: ["Institution - Assets & Verification Examples"],
      summary: "Get document assets of an institution",
      security: [{ bearerAuth: [] }],
      description:
        "Fetches institution sample cards and system templates with optional filtering by asset scope.",
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
        },
        {
          name: "asset_scope",
          in: "query",
          required: false,
          schema: {
            $ref: "#/components/schemas/FileAssetScopeEnum",
          },
          example: "tenant_private",
        },
      ],
      responses: {
        200: {
          description: "Document assets list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/FileAssetEntityDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        404: {
          description: "Invalid institution",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/add-institution-document": {
    post: {
      tags: ["Institution - Assets & Verification Examples"],
      summary: "Upload document template or student sample card",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AddFileAssetDto",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Document asset added",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/delete-institution-document": {
    delete: {
      tags: ["Institution - Assets & Verification Examples"],
      summary: "Delete a document asset",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "asset_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Document deleted",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  // Section 6: Registration Automation Keywords

  "/api/v1/institution/get-automatic-registration-keywords": {
    get: {
      tags: ["Institution - Registration Automation"],
      summary: "Get all automatic registration keywords for an institution",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
          example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
        },
      ],
      responses: {
        200: {
          description: "Automatic registration keywords list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/AutomaticRegistrationKeywordEntityDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
        404: {
          description: "Invalid institution",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/add-automatic-registration-keyword": {
    post: {
      tags: ["Institution - Registration Automation"],
      summary: "Add automatic approval keyword",
      security: [{ bearerAuth: [] }],
      description:
        "Defines keywords used for automatic approval matching during student registration.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AddAutomaticRegistrationKeywordDto",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Keyword added",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/remove-automatic-registration-keyword": {
    delete: {
      tags: ["Institution - Registration Automation"],
      summary: "Remove automatic registration keyword",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "keyword_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Keyword removed",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  // Section 7: Holidays & Calendar

  "/api/v1/institution/get-institution-holidays": {
    get: {
      tags: ["Institution - Holidays & Calendar"],
      summary: "Get all holidays for an institution",
      security: [{ bearerAuth: [] }],
      description:
        "Lists recurring and manual holidays. Can be optionally filtered by `holiday_type` ('recurring' or 'manual').",
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "holiday_type",
          in: "query",
          required: false,
          schema: {
            $ref: "#/components/schemas/HolidayTypeEnum",
          },
        },
      ],
      responses: {
        200: {
          description: "Holidays list",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/InstitutionHolidayDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/add-recurring-holiday": {
    post: {
      tags: ["Institution - Holidays & Calendar"],
      summary: "Add weekly recurring holiday(s) (e.g. Friday, Saturday)",
      security: [{ bearerAuth: [] }],
      description:
        "Configures recurring closure days of the week. Existing recurring days are skipped automatically.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AddRecurringHolidayDto",
            },
            examples: {
              singleDay: {
                summary: "Single Day Example",
                value: {
                  institution_id: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
                  day: "friday",
                },
              },
              multipleDays: {
                summary: "Weekend Days Example",
                value: {
                  institution_id: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
                  days: ["friday", "saturday"],
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Recurring holidays added successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  count: { type: "integer", example: 2 },
                  addedHolidays: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/InstitutionHolidayDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/add-manual-holiday": {
    post: {
      tags: ["Institution - Holidays & Calendar"],
      summary: "Add manual holiday (Single date or Date range)",
      security: [{ bearerAuth: [] }],
      description:
        "Allows setting either a single particular date or a continuous date range (`start_date` to `end_date`, max 365 days).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/AddManualHolidayDto",
            },
            examples: {
              singleDate: {
                summary: "Single Date Example",
                value: {
                  institution_id: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
                  date: "2026-10-15",
                },
              },
              dateRange: {
                summary: "Date Range (Eid Vacation) Example",
                value: {
                  institution_id: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
                  start_date: "2026-10-15",
                  end_date: "2026-10-20",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "Manual holiday(s) added successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  message: { type: "string" },
                  count: { type: "integer", example: 6 },
                  addedHolidays: {
                    type: "array",
                    items: {
                      $ref: "#/components/schemas/InstitutionHolidayDto",
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/institution/delete-institution-holiday": {
    delete: {
      tags: ["Institution - Holidays & Calendar"],
      summary: "Delete an institution holiday",
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: "institution_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "institution_holidays_id",
          in: "query",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      responses: {
        200: {
          description: "Holiday deleted successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        401: {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorMessageResponse",
              },
            },
          },
        },
      },
    },
  },
};
