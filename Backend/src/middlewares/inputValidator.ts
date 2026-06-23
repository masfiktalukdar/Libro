import { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";

export class InputValidationMiddleware {
  public validate(schema: ZodType) {
    return async (
      req: Request,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        req.body = await schema.parseAsync(req.body);

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          });

          return;
        }

        next(error);
      }
    };
  }
}

export const inputValidator = new InputValidationMiddleware();
