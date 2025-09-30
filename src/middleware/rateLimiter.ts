import rateLimit from "express-rate-limit";
import logger from "../lib/logger";

// General API limiter (100 requests per 15 minutes per IP)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later",
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `Rate limit exceeded: IP=${req.ip}, URL=${req.originalUrl}`
    );
    res.status(options.statusCode).json(options.message);
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});
