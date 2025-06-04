import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";

// Configure Redis (optional - falls back to memory store)
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

export class RateLimiter {
  // General API rate limiting
  static general = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      success: false,
      error: "Rate limit exceeded",
      message: "Too many requests from this IP, please try again later.",
      retryAfter: "15 minutes",
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
    store: redis
      ? new RedisStore({
          sendCommand: (...args: string[]) => redis.call(...args),
        })
      : undefined,
  });

  // Strict rate limiting for auth endpoints
  static auth = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    skipSuccessfulRequests: true, // Don't count successful requests
    message: {
      success: false,
      error: "Authentication rate limit exceeded",
      message: "Too many authentication attempts, please try again later.",
      retryAfter: "15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redis
      ? new RedisStore({
          sendCommand: (...args: string[]) => redis.call(...args),
        })
      : undefined,
  });

  // Very strict rate limiting for registration
  static registration = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: {
      success: false,
      error: "Registration rate limit exceeded",
      message: "Too many registration attempts, please try again in an hour.",
      retryAfter: "1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redis
      ? new RedisStore({
          sendCommand: (...args: string[]) => redis.call(...args),
        })
      : undefined,
  });

  // Password reset rate limiting
  static passwordReset = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 password reset requests per hour
    message: {
      success: false,
      error: "Password reset rate limit exceeded",
      message: "Too many password reset attempts, please try again later.",
      retryAfter: "1 hour",
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redis
      ? new RedisStore({
          sendCommand: (...args: string[]) => redis.call(...args),
        })
      : undefined,
  });
}
