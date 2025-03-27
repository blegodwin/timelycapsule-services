import express from "express";
import { StreakController } from "../controllers/streak.controller";

const streakRouter = (router: express.Router) => {
  router.post("/activity/:userId", StreakController.recordActivity);
  router.get("/streak/:userId", StreakController.getStreak);
};

export default streakRouter;