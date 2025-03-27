import { Request, Response } from 'express';
import { PublicCapsule } from '../model/PublicCapsule';

// Fetch featured public capsules with pagination
export const getFeaturedPublicCapsules = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const capsules = await PublicCapsule.find({ visibility: 'featured' })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: capsules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error });
  }
};

// Create a new public capsule (optional)
export const createPublicCapsule = async (req: Request, res: Response) => {
  try {
    const { title, content, media, visibility, creator, unlockAt, expiresAt } = req.body;

    const newCapsule = new PublicCapsule({
      title,
      content,
      media,
      visibility,
      creator,
      unlockAt,
      expiresAt,
    });

    await newCapsule.save();
    res.status(201).json({ success: true, data: newCapsule });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid data', error });
  }
};
