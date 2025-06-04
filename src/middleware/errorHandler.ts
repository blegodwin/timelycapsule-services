import { Request, Response, NextFunction } from "express";

export interface StandardError {
  success: false;
  error: string;
  message: string;
  details?: any;
  timestamp?: string;
  path?: string;
  statusCode?: number;
}

export class ErrorHandler {
  // Global error handler
  static handleErrors(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Error occurred:", error);

    const standardError: StandardError = {
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
      path: req.path,
      statusCode: 500,
    };

    // Handle Joi validation errors
    if (error.isJoi) {
      standardError.error = "Validation Error";
      standardError.message = "Invalid input data";
      standardError.details = error.details.map((detail: any) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      standardError.statusCode = 400;
      res.status(400).json(standardError);
      return;
    }

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      standardError.error = "Database Validation Error";
      standardError.message = "Data validation failed";
      standardError.details = Object.values(error.errors).map((err: any) => ({
        field: err.path,
        message: err.message,
      }));
      standardError.statusCode = 400;
      res.status(400).json(standardError);
      return;
    }

    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      standardError.error = "Duplicate Entry";
      standardError.message = `${field} already exists`;
      standardError.statusCode = 409;
      res.status(409).json(standardError);
      return;
    }

    // Handle JWT errors
    if (error.name === "JsonWebTokenError") {
      standardError.error = "Authentication Error";
      standardError.message = "Invalid token";
      standardError.statusCode = 401;
      res.status(401).json(standardError);
      return;
    }

    // Handle rate limiting errors
    if (error.statusCode === 429) {
      standardError.error = "Rate Limit Exceeded";
      standardError.message = "Too many requests, please try again later";
      standardError.statusCode = 429;
      res.status(429).json(standardError);
      return;
    }

    // Default error response
    res.status(500).json(standardError);
  }

  // Create standardized success response
  static successResponse(
    data?: any,
    message: string = "Success",
    statusCode: number = 200
  ) {
    const response: any = {
      success: true,
      message,
      timestamp: new Date().toISOString(),
    };

    if (data !== undefined) {
      response.data = data;
    }

    return { response, statusCode };
  }
}
