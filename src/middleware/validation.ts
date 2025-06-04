import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export class ValidationMiddleware {
  static validate(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.body, {
        abortEarly: false, // Validate all fields
        stripUnknown: true, // Remove unknown fields
        convert: true, // Convert types where possible
      });

      if (error) {
        const validationErrors: ValidationError[] = error.details.map(
          (detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
          })
        );

        res.status(400).json({
          success: false,
          error: "Validation failed",
          message: "Invalid input data",
          details: validationErrors,
        });
        return;
      }

      // Replace req.body with validated and sanitized data
      req.body = value;
      next();
    };
  }

  // Validate query parameters
  static validateQuery(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const validationErrors: ValidationError[] = error.details.map(
          (detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
          })
        );

        res.status(400).json({
          success: false,
          error: "Query validation failed",
          message: "Invalid query parameters",
          details: validationErrors,
        });
        return;
      }

      req.query = value;
      next();
    };
  }

  // Validate route parameters
  static validateParams(schema: Joi.ObjectSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const { error, value } = schema.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true,
      });

      if (error) {
        const validationErrors: ValidationError[] = error.details.map(
          (detail) => ({
            field: detail.path.join("."),
            message: detail.message,
            value: detail.context?.value,
          })
        );

        res.status(400).json({
          success: false,
          error: "Parameter validation failed",
          message: "Invalid route parameters",
          details: validationErrors,
        });
        return;
      }

      req.params = value;
      next();
    };
  }
}
