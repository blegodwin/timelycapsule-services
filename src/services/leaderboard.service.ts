import Leaderboard from "../model/leaderboard.model";
import { calculateScore, calculateRank } from "../utils/ranking";

export async function getLeaderboard(timeRange: string) {
    let filter = {};

    const now = new Date();
    if (timeRange === "weekly") {
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        filter = { createdAt: { $gte: lastWeek } };
    } else if (timeRange === "monthly") {
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        filter = { createdAt: { $gte: lastMonth } };
    }

    const users = await Leaderboard.find(filter).sort({ totalScore: -1 }).limit(20);
    
    return users.map(user => ({
        username: user.username,
        interactions: user.interactions,
        contributions: user.contributions,
        streaks: user.streaks,
        totalScore: user.totalScore,
        rank: calculateRank(user.totalScore),
    }));
}
