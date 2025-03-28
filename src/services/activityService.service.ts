import { Activity } from '../models/activity.model';
import { Follow } from '../models/follow.model';

export class ActivityService {
  async createActivity(userId: string, type: string, content: string) {
    return Activity.create({ user: userId, type, content });
  }

  async getFeed(userId: string, page: number = 1, limit: number = 10) {
    const following = await Follow.find({ follower: userId }).distinct(
      'following'
    );
    return Activity.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user');
  }
}
