import { Follow } from '../models/follow.model';

export class FollowService {
  async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) throw new Error('Cannot follow yourself');

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });
    if (existingFollow) throw new Error('Already following user');

    return Follow.create({ follower: followerId, following: followingId });
  }

  async unfollowUser(followerId: string, followingId: string) {
    const result = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });
    if (!result) throw new Error('Follow relationship not found');
    return result;
  }

  async getFollowers(userId: string) {
    return Follow.find({ following: userId }).populate('follower');
  }

  async getFollowing(userId: string) {
    return Follow.find({ follower: userId }).populate('following');
  }
}
