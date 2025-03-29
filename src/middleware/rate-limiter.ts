import rateLimit from "express-rate-limit"

// Configure rate limiting
// Allow 5 confession submissions per IP address per hour
export const rateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: "Too many confession submissions, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

