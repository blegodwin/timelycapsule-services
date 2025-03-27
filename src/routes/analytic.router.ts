import express from "express";
import AnalyticsService from "../services/analytics.service";

const router = express.Router();

const analyticsRouter = (router: express.Router) => {
  router.get("/player-engagement", async (req, res) => {
    try {
      const data = await AnalyticsService.getPlayerEngagement();
      res.json({ success: true, data });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching player engagement" });
    }
  });

  router.get("/popular-song-categories", async (req, res) => {
    try {
      const data = await AnalyticsService.getPopularSongCategories();
      res.json({ success: true, data });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error fetching song categories" });
    }
  });

  router.get("/token-economy", async (req, res) => {
    try {
      const data = await AnalyticsService.getTokenEconomy();
      res.json({ success: true, data });
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Error fetching token economy stats",
        });
    }
  });

  router.get("/user-progression", async (req, res) => {
    try {
      const data = await AnalyticsService.getUserProgression();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user progression stats",
      });
    }
  });
};

export default router;
