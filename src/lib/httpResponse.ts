// lib/httpResponse.ts
import { Response } from "express";

/**
 * Standard HTTP response helper
 * @param statusCode - HTTP status code (200, 400, 500, etc.)
 * @param message - Success or error message
 * @param data - Optional payload
 * @param res - Express Response object
 */
export function httpResponse(
  statusCode: number,
  message: string,
  data: object = {},
  res: Response
) {
  return res.status(statusCode).json({
    status: statusCode < 400 ? "success" : "error",
    message,
    data,
  });
}
