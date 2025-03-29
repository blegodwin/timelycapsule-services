import express from "express"
import { createConfession, getConfessions } from "../controllers/confession.controller"
import { rateLimiter } from "../middleware/rate-limiter"

const router = express.Router()

// Apply rate limiting to confession submission
router.post("/", rateLimiter, createConfession)

// Get confessions with pagination
router.get("/", getConfessions)

export default router

