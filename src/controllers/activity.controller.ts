import { Request, Response } from 'express';
import { ActivityService } from '../services/activityService.service';

const activityService = new ActivityService();

export const getActivityFeed = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const feed = await activityService.getFeed(userId, page, limit);
    res.status(200).json(feed);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
