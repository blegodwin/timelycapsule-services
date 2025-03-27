import mongoose from 'mongoose';
import { IStreak, Streak } from '../model/streak-model';

export class StreakService {
  // Update streak for a user's activity
  async updateStreak(userId: string): Promise<IStreak> {
    const today = new Date();
    
    // Find or create streak record
    let streak = await Streak.findOne({ userId });
    if (!streak) {
      streak = new Streak({ userId });
    }

    // Calculate date differences
    const lastActivityDate = streak.lastActivityDate || new Date(0);
    const daysDifference = this.calculateDaysDifference(lastActivityDate, today);

    // Update streak logic
    if (daysDifference === 1) {
      // Consecutive day
      streak.currentStreak += 1;
      
      // Update longest streak
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
      
      // Check milestone rewards
      this.checkMilestoneRewards(streak);
    } else if (daysDifference > 1) {
      // Streak broken
      streak.currentStreak = 1;
    }

    // Update last activity date
    streak.lastActivityDate = today;

    // Save and return
    return await streak.save();
  }

  // Calculate days difference between two dates
  private calculateDaysDifference(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const diffDays = Math.round(Math.abs((date2.getTime() - date1.getTime()) / oneDay));
    return diffDays;
  }

  // Check and update milestone rewards
  private checkMilestoneRewards(streak: IStreak): void {
    const milestones = [7, 30, 90, 365];
    
    milestones.forEach(milestone => {
      if (streak.currentStreak >= milestone && 
          !streak.milestoneRewards[milestone].achieved) {
        streak.milestoneRewards[milestone] = {
          achieved: true,
          achievedAt: new Date()
        };
      }
    });
  }

  // Fetch user streak
  async getStreak(userId: string): Promise<IStreak | null> {
    return await Streak.findOne({ userId });
  }
}

export default new StreakService();