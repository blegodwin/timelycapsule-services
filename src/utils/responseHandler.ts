// utils/responseHandler.ts
import { Response } from "express";

export const handleResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): void => {
  res.status(statusCode).json({ message, data });
};
