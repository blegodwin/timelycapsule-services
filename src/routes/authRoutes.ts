import express, { Router, Request, Response } from "express";
import { AuthController } from "../controllers/authController";
import { AuthMiddleware } from "../middleware/auth";
import { ValidationMiddleware } from "../middleware/validation";
import { SanitizationMiddleware } from "../middleware/sanitization";
import { ErrorHandler } from "../middleware/errorHandler";
import { RateLimiter } from "../middleware/rateLimiter";
import { authSchemas } from "../validation/authSchema";

const router: Router = express.Router();

// Apply general rate limiting to all auth routes
router.use(RateLimiter.general);

// Apply sanitization to all routes
router.use(SanitizationMiddleware.sanitizeInput);

// Public routes with validation
router.post(
  "/register",
  RateLimiter.registration,
  ValidationMiddleware.validate(authSchemas.register),
  (req: Request, res: Response) => {
    AuthController.register(req, res);
  }
);

router.post(
  "/login",
  RateLimiter.auth,
  ValidationMiddleware.validate(authSchemas.login),
  (req: Request, res: Response) => {
    AuthController.login(req, res);
  }
);

router.post(
  "/refresh",
  RateLimiter.auth,
  ValidationMiddleware.validate(authSchemas.refreshToken),
  (req: Request, res: Response) => {
    AuthController.refreshToken(req, res);
  }
);

// Protected routes with validation
router.post(
  "/logout",
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validate(authSchemas.logout),
  (req: Request, res: Response) => {
    AuthController.logout(req, res);
  }
);

router.post(
  "/logout-all",
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    AuthController.logoutAll(req, res);
  }
);

router.get("/me", AuthMiddleware.requireAuth, (req: Request, res: Response) => {
  AuthController.getCurrentUser(req, res);
});

router.put(
  "/profile",
  AuthMiddleware.requireAuth,
  ValidationMiddleware.validate(authSchemas.updateProfile),
  (req: Request, res: Response) => {
    AuthController.updateProfile(req, res);
  }
);

router.get(
  "/sessions",
  AuthMiddleware.requireAuth,
  (req: Request, res: Response) => {
    AuthController.getUserSessions(req, res);
  }
);

// Apply error handler
router.use(ErrorHandler.handleErrors);

export default router;
