import { Request, Response, NextFunction } from "express";
import DOMPurify from "isomorphic-dompurify";
import validator from "validator";

export class SanitizationMiddleware {
  static sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    try {
      // Sanitize request body
      if (req.body && typeof req.body === "object") {
        req.body = SanitizationMiddleware.deepSanitize(req.body);
      }

      // Sanitize query parameters
      if (req.query && typeof req.query === "object") {
        req.query = SanitizationMiddleware.deepSanitize(req.query);
      }

      // Sanitize route parameters
      if (req.params && typeof req.params === "object") {
        req.params = SanitizationMiddleware.deepSanitize(req.params);
      }

      next();
    } catch (error) {
      console.error("Sanitization error:", error);
      res.status(400).json({
        success: false,
        error: "Invalid input data",
        message: "Request contains invalid characters",
      });
    }
  }

  private static deepSanitize(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "string") {
      // Remove potential XSS attacks
      let sanitized = DOMPurify.sanitize(obj);

      // Escape HTML entities
      sanitized = validator.escape(sanitized);

      // Trim whitespace
      sanitized = sanitized.trim();

      return sanitized;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => SanitizationMiddleware.deepSanitize(item));
    }

    if (typeof obj === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize both key and value
        const sanitizedKey = validator.escape(key.trim());
        sanitized[sanitizedKey] = SanitizationMiddleware.deepSanitize(value);
      }
      return sanitized;
    }

    return obj;
  }
}
