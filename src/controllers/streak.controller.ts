import { Request, Response } from 'express';
import { StreakService } from '../services/streak-service';
import { ErrorHandler } from '../utils/errorHandler';


export class StreakController {
  // Record user activity and update streak
  static async recordActivity(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Validate userId
      if (!userId) {
        return res.status(400).json({ 
          message: 'User ID is required' 
        });
      }

      const updatedStreak = await StreakService.updateStreak(userId);
      
      res.status(200).json({
        message: 'Streak updated successfully',
        streak: {
          current: updatedStreak.currentStreak,
          longest: updatedStreak.longestStreak,
          milestones: updatedStreak.milestoneRewards
        }
      });
    } catch (error) {
      ErrorHandler.handleError(res, error);
    }
  }

  // Fetch user streak
  static async getStreak(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      
      // Validate userId
      if (!userId) {
        return res.status(400).json({ 
          message: 'User ID is required' 
        });
      }

      const streak = await StreakService.getStreak(userId);
      
      if (!streak) {
        return res.status(404).json({ 
          message: 'No streak found for user' 
        });
      }
      
      res.status(200).json({
        current: streak.currentStreak,
        longest: streak.longestStreak,
        milestones: streak.milestoneRewards
      });
    } catch (error) {
      ErrorHandler.handleError(res, error);
    }
  }
}