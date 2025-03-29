import { Router } from "express";
import { leaderboardHandler } from "../controllers/leaderboard.controller";

const router = Router();

router.get("/leaderboard", leaderboardHandler);

export default router;
