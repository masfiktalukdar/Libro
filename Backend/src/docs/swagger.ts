import { Express, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { commonSwaggerSchemas } from "./swagger.schemas.js";
import {
  authSwaggerPaths,
  authSwaggerSchemas,
} from "@modules/auth/auth.swagger.js";
import {
  institutionSwaggerPaths,
  institutionSwaggerSchemas,
} from "@modules/institution/institution.swagger.js";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Libro SaaS - Multi-Tenant Library Management API",
    version: "1.0.0",
    description: `
## Welcome to the Libro SaaS API Documentation
Libro is a multi-tenant library management system designed for universities, colleges, and polytechnic institutes.

### Key Highlights:
- **Authentication & User Management**: Multi-role onboarding (students and staff).
- **Institution Management**: Full lifecycle management (onboarding, departments, shifts, verification assets).
- **Institution Holidays**: Distinct handling for weekly recurring closures (e.g., Friday/Saturday) and manual dates/ranges (e.g., Eid/Summer Vacation).
- **Strict Validation**: All endpoints enforce sanitization and type-safe Zod DTO validation.

---
*Raw OpenAPI specification is available at* [\`/api/v1/docs.json\`](/api/v1/docs.json)
    `,
    contact: {
      name: "Libro Engineering Team",
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 3000}`,
      description: "Local Development Server",
    },
  ],
  tags: [
    {
      name: "Authentication & Institutional Users",
      description: "Institutional student and staff registration and auth",
    },
    {
      name: "Institution - Onboarding & Registration",
      description: "Registration requests, email OTP verification, and tenant creation",
    },
    {
      name: "Institution - Profile & Settings",
      description: "Tenant details, general library parameters, and sensitive credential updates",
    },
    {
      name: "Institution - Departments",
      description: "Academic department management for the institution",
    },
    {
      name: "Institution - Shifts",
      description: "Academic shifts and operating schedules",
    },
    {
      name: "Institution - Assets & Verification Examples",
      description: "Official documents and student ID sample templates",
    },
    {
      name: "Institution - Registration Automation",
      description: "Keywords for automated student application approval",
    },
    {
      name: "Institution - Holidays & Calendar",
      description: "Recurring weekly closures and manual single/range holiday events",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: Bearer <token>",
      },
    },
    schemas: {
      ...commonSwaggerSchemas,
      ...authSwaggerSchemas,
      ...institutionSwaggerSchemas,
    },
  },
  paths: {
    ...authSwaggerPaths,
    ...institutionSwaggerPaths,
  },
};

/**
 * Configure and mount Swagger UI on the Express application.
 * Swagger is only enabled when NODE_ENV is 'development', served exclusively at /api/v1/docs.
 */
export const setupSwagger = (app: Express): void => {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Hide Swagger documentation completely if not in development mode
  if (!isDevelopment) {
    return;
  }

  const swaggerUiOptions = {
    customSiteTitle: "Libro API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "list",
      filter: true,
    },
  };

  // Serve Swagger UI ONLY at /api/v1/docs
  app.use(
    "/api/v1/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions),
  );

  // Serve raw OpenAPI JSON for client SDK generators / Postman import
  app.get("/api/v1/docs.json", (_req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
