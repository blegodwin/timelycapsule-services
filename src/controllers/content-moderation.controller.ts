import { Request, Response } from 'express';
import { contentModerationService } from '../services/contentModeration.service';
import { Types } from 'mongoose';

export const getFlaggedContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, page = '1', limit = '10' } = req.query;
    
    const result = await contentModerationService.getFlaggedCapsules(
      status as 'pending' | 'reviewed' | 'cleared',
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flagged content' });
  }
};

export const reviewFlaggedContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { flagId } = req.params;
    const { action } = req.body;
    const reviewerId = new Types.ObjectId(req.user?._id);

    if (!['clear', 'confirm'].includes(action)) {
      res.status(400).json({ error: 'Invalid action' });
      return;
    }

    const result = await contentModerationService.reviewFlag(
      new Types.ObjectId(flagId),
      reviewerId,
      action as 'clear' | 'confirm'
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to review flagged content' });
  }
};
