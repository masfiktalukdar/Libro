export const authSwaggerSchemas = {
  GenderEnum: {
    type: "string",
    enum: ["male", "female", "other"],
    example: "male",
  },

  BaseInstitutionalUserDto: {
    type: "object",
    properties: {
      full_name: {
        type: "string",
        minLength: 3,
        maxLength: 255,
        example: "Masfikul Islam",
      },
      user_email: {
        type: "string",
        format: "email",
        example: "masfik@example.com",
      },
      user_phone: {
        type: "string",
        pattern: "^(\\+8801|01)[3-9]\\d{8}$",
        example: "01712345678",
        description: "Valid Bangladeshi phone number",
      },
      user_password_plaintext: {
        type: "string",
        minLength: 8,
        maxLength: 100,
        example: "SecretPassword@123",
      },
      gender: {
        $ref: "#/components/schemas/GenderEnum",
      },
      avatar_url: {
        type: "string",
        format: "uri",
        nullable: true,
        example: "https://example.com/avatar.jpg",
      },
      institution_id: {
        type: "string",
        format: "uuid",
        example: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
      },
      user_id: {
        type: "string",
        format: "uuid",
        example: "a8a9018e-4a6c-48be-81f1-ec46487e4922",
      },
      institution_member_id: {
        type: "string",
        minLength: 1,
        maxLength: 100,
        example: "c7f9901e-4a6c-48be-81f1-ec46487e4933",
      },
    },
    required: [
      "full_name",
      "user_email",
      "user_phone",
      "user_password_plaintext",
      "gender",
      "institution_id",
      "user_id",
      "institution_member_id",
    ],
  },

  StudentRegistrationDto: {
    allOf: [
      { $ref: "#/components/schemas/BaseInstitutionalUserDto" },
      {
        type: "object",
        properties: {
          role: {
            type: "string",
            enum: ["student"],
            example: "student",
          },
          department_id: {
            type: "string",
            format: "uuid",
            example: "f2c06950-8b21-4f10-9b0d-45db6e118944",
          },
          shift_id: {
            type: "string",
            format: "uuid",
            example: "d1a89c20-3b4e-4f5a-8b1c-901234567890",
          },
          student_roll_no: {
            type: "string",
            minLength: 1,
            maxLength: 50,
            example: "601245",
          },
          student_registration_no: {
            type: "string",
            minLength: 1,
            maxLength: 50,
            example: "1502123456",
          },
          student_session: {
            type: "string",
            minLength: 1,
            maxLength: 20,
            example: "2023-2024",
          },
        },
        required: [
          "role",
          "department_id",
          "shift_id",
          "student_roll_no",
          "student_registration_no",
          "student_session",
        ],
      },
    ],
  },

  StaffRegistrationDto: {
    allOf: [
      { $ref: "#/components/schemas/BaseInstitutionalUserDto" },
      {
        type: "object",
        properties: {
          role: {
            type: "string",
            enum: ["staff"],
            example: "staff",
          },
          department_id: {
            type: "string",
            format: "uuid",
            example: "f2c06950-8b21-4f10-9b0d-45db6e118944",
          },
          shift_id: {
            type: "string",
            format: "uuid",
            example: "d1a89c20-3b4e-4f5a-8b1c-901234567890",
          },
          staff_employee_id: {
            type: "string",
            minLength: 1,
            maxLength: 50,
            example: "EMP-9082",
          },
          about_staff: {
            type: "string",
            maxLength: 5000,
            example: "Senior Assistant Librarian with 6 years experience.",
          },
          chamber_location: {
            type: "string",
            minLength: 1,
            maxLength: 255,
            example: "Library Block, Room 204",
          },
          joining_date: {
            type: "string",
            format: "date",
            example: "2024-01-15",
          },
        },
        required: [
          "role",
          "department_id",
          "shift_id",
          "staff_employee_id",
          "chamber_location",
          "joining_date",
        ],
      },
    ],
  },

  RegisterInstitutionalUserPayloadDto: {
    oneOf: [
      { $ref: "#/components/schemas/StudentRegistrationDto" },
      { $ref: "#/components/schemas/StaffRegistrationDto" },
    ],
    discriminator: {
      propertyName: "role",
    },
  },
};

export const authSwaggerPaths = {
  "/api/v1/users/register-user": {
    post: {
      tags: ["Authentication & Institutional Users"],
      summary: "Register an institutional student or staff user",
      description:
        "Creates a new institutional member account. Discriminated by `role` ('student' or 'staff').",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/RegisterInstitutionalUserPayloadDto",
            },
            examples: {
              student: {
                summary: "Student Registration Example",
                value: {
                  full_name: "Masfikul Islam",
                  user_email: "student@example.com",
                  user_phone: "01712345678",
                  user_password_plaintext: "Password@123",
                  gender: "male",
                  avatar_url: "https://example.com/avatar.jpg",
                  institution_id: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
                  user_id: "a8a9018e-4a6c-48be-81f1-ec46487e4922",
                  institution_member_id: "mem-uuid-1234",
                  role: "student",
                  department_id: "f2c06950-8b21-4f10-9b0d-45db6e118944",
                  shift_id: "d1a89c20-3b4e-4f5a-8b1c-901234567890",
                  student_roll_no: "601245",
                  student_registration_no: "1502123456",
                  student_session: "2023-2024",
                },
              },
              staff: {
                summary: "Staff Registration Example",
                value: {
                  full_name: "Rahim Chowdhury",
                  user_email: "staff@example.com",
                  user_phone: "01812345678",
                  user_password_plaintext: "Password@123",
                  gender: "male",
                  avatar_url: null,
                  institution_id: "b3f3e1b0-13f5-4e78-9a42-d6fc13997e01",
                  user_id: "a8a9018e-4a6c-48be-81f1-ec46487e4923",
                  institution_member_id: "mem-uuid-5678",
                  role: "staff",
                  department_id: "f2c06950-8b21-4f10-9b0d-45db6e118944",
                  shift_id: "d1a89c20-3b4e-4f5a-8b1c-901234567890",
                  staff_employee_id: "EMP-9082",
                  about_staff: "Senior Assistant Librarian",
                  chamber_location: "Library Block, Room 204",
                  joining_date: "2024-01-15",
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/SuccessMessageResponse",
              },
            },
          },
        },
        400: {
          description: "Validation error or invalid request body",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationErrorResponse",
              },
            },
          },
        },
        500: {
          description: "Internal server error",
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
