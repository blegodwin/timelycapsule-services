import express, { Router } from "express";
import healthRoutes from "./features/health";
import authRoutes from "./features/auth.routes";
import unlockRoutes from "./features/unlock.routes";

const router: Router = express.Router();

// Mount feature routes
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/unlock", unlockRoutes);

export default router;
