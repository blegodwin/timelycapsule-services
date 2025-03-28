import { Request, Response } from 'express';
import { FollowService } from '../services/followService.services';

const followService = new FollowService();

export const followUser = async (req: Request, res: Response) => {
  try {
    const { followerId, followingId } = req.body;
    const result = await followService.followUser(followerId, followingId);
    res.status(201).json(result);
  } catch (error) {
    handleFollowError(res, error);
  }
};

export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const { followerId, followingId } = req.body;
    const result = await followService.unfollowUser(followerId, followingId);
    res.status(200).json(result);
  } catch (error) {
    handleFollowError(res, error);
  }
};

function handleFollowError(res: Response, error: any) {
  switch (error.message) {
    case 'Cannot follow yourself':
      res.status(400).json({ error: error.message });
      break;
    case 'Already following user':
      res.status(409).json({ error: error.message });
      break;
    case 'Follow relationship not found':
      res.status(404).json({ error: error.message });
      break;
    default:
      res.status(500).json({ error: 'Internal server error' });
  }
}
