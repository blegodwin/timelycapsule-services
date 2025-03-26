import { Request } from "express";
import { EngagementMetrics } from "../models/EngagementMetrics";
import { SongCategoryStats } from "../models/SongCategoryStats";
import { TokenStats } from "../models/TokenStats";

class AnalyticsService {
  async getPlayerEngagement() {
    return await EngagementMetrics.find({});
  }

  async getPopularSongCategories() {
    return await SongCategoryStats.find({})
      .sort({ playCount: -1 })
      .limit(10);
  }

  async getTokenEconomy() {
    return await TokenStats.aggregate([
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  async getUserProgression() {
    return await EngagementMetrics.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSessions: { $sum: 1 },
          totalPlayTime: { $sum: "$sessionDuration" }
        }
      }
    ]);
  }
}

export default new AnalyticsService();
