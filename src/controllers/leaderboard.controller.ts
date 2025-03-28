import { Request, Response } from "express";
import { getLeaderboard } from "../services/leaderboard.service";

export async function leaderboardHandler(req: Request, res: Response) {
    try {
        const timeRange = req.query.range as string || "all-time";
        const leaderboard = await getLeaderboard(timeRange);

        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
