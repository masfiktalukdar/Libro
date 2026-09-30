/**
 * Common OpenAPI Response and Error DTO Schemas
 */
export const commonSwaggerSchemas = {
  SuccessMessageResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true,
      },
      message: {
        type: "string",
        example: "Operation completed successfully",
      },
    },
    required: ["success", "message"],
  },

  ErrorMessageResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      error: {
        type: "string",
        example: "Bad Request",
      },
      message: {
        type: "string",
        example: "Detailed error description",
      },
    },
    required: ["success", "message"],
  },

  ValidationErrorItem: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      field: {
        type: "string",
        example: "institution_email",
      },
      message: {
        type: "string",
        example: "Invalid email address",
      },
    },
    required: ["success", "field", "message"],
  },

  ValidationErrorResponse: {
    type: "array",
    items: {
      $ref: "#/components/schemas/ValidationErrorItem",
    },
  },
};
