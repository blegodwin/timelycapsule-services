import express from "express";
import asyncHandler from "express-async-handler";
import * as capsuleController from "../controllers/capsule.controller";

const router = express.Router();

router.post("/", asyncHandler(capsuleController.createCapsule));
router.get("/", asyncHandler(capsuleController.getCapsules));
router.get("/by-email", asyncHandler(capsuleController.getCapsulesByEmail));
router.get("/:id", asyncHandler(capsuleController.getCapsule));
router.put("/:id", asyncHandler(capsuleController.updateCapsule));
router.delete("/:id", asyncHandler(capsuleController.deleteCapsule));

export default router;
