import { Request, Response } from 'express';
import { Capsule } from '../models/Capsule';
import { User } from '../models/User';
import mongoose from 'mongoose';

interface CreateCapsuleRequest {
  title: string;
  description?: string;
  type: 'personal' | 'group' | 'public';
  visibility?: 'private' | 'public' | 'unlisted';
  category: string;
  content: {
    text?: string;
    mediaFiles?: string[];
  };
  tags?: string[];
  unlockDate?: string;
  unlockPassword?: string;
  passwordHint?: string;
  unlockLocation?: {
    coordinates: [number, number];
    radius?: number;
    address?: string;
  };
  collaborators?: string[];
  maxCollaborators?: number;
}

export const createCapsule = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id; // Assuming user is attached to req via auth middleware

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const {
      title,
      description,
      type,
      visibility = 'private',
      category,
      content,
      tags = [],
      unlockDate,
      unlockPassword,
      passwordHint,
      unlockLocation,
      collaborators = [],
      maxCollaborators = 10,
    }: CreateCapsuleRequest = req.body;

    // Validation
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!type || !['personal', 'group', 'public'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid capsule type is required (personal, group, or public)',
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }

    // Validate content exists
    if (
      !content?.text?.trim() &&
      (!content?.mediaFiles || content.mediaFiles.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Capsule must contain either text content or media files',
      });
    }

    // Validate collaborators if provided
    if (collaborators.length > 0) {
      const validCollaborators = await User.find({
        _id: {
          $in: collaborators.map((id) => new mongoose.Types.ObjectId(id)),
        },
      }).select('_id');

      if (validCollaborators.length !== collaborators.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more collaborators not found',
        });
      }
    }

    // Validate unlock date if provided
    let parsedUnlockDate: Date | undefined;
    if (unlockDate) {
      parsedUnlockDate = new Date(unlockDate);
      if (isNaN(parsedUnlockDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid unlock date format',
        });
      }

      if (parsedUnlockDate <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Unlock date must be in the future',
        });
      }
    }

    // Validate location if provided
    if (unlockLocation) {
      const { coordinates, radius = 100 } = unlockLocation;
      if (
        !coordinates ||
        coordinates.length !== 2 ||
        typeof coordinates[0] !== 'number' ||
        typeof coordinates[1] !== 'number'
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid location coordinates',
        });
      }

      if (
        coordinates[1] < -90 ||
        coordinates[1] > 90 ||
        coordinates[0] < -180 ||
        coordinates[0] > 180
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid latitude/longitude values',
        });
      }
    }

    // Create capsule object
    const capsuleData: any = {
      title: title.trim(),
      description: description?.trim(),
      creator: new mongoose.Types.ObjectId(userId),
      type,
      visibility,
      category: category.trim(),
      content: {
        text: content.text?.trim(),
        mediaFiles:
          content.mediaFiles?.map((id) => new mongoose.Types.ObjectId(id)) ||
          [],
      },
      tags: tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      collaborators: collaborators.map((id) => new mongoose.Types.ObjectId(id)),
      maxCollaborators,
      status: 'draft',
    };

    // Add optional fields
    if (parsedUnlockDate) {
      capsuleData.unlockDate = parsedUnlockDate;
    }

    if (unlockPassword) {
      capsuleData.unlockPassword = unlockPassword;
      capsuleData.passwordHint = passwordHint?.trim();
    }

    if (unlockLocation) {
      capsuleData.unlockLocation = {
        type: 'Point',
        coordinates: unlockLocation.coordinates,
        radius: unlockLocation.radius || 100,
        address: unlockLocation.address?.trim(),
      };
    }

    // Create the capsule
    const capsule = new Capsule(capsuleData);
    await capsule.save();

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.capsulesCreated': 1 },
    });

    // Populate creator info for response
    await capsule.populate('creator', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Capsule created successfully',
      data: {
        capsule: {
          _id: capsule._id,
          title: capsule.title,
          description: capsule.description,
          type: capsule.type,
          visibility: capsule.visibility,
          status: capsule.status,
          category: capsule.category,
          tags: capsule.tags,
          creator: capsule.creator,
          collaborators: capsule.collaborators,
          maxCollaborators: capsule.maxCollaborators,
          unlockDate: capsule.unlockDate,
          passwordHint: capsule.passwordHint,
          unlockLocation: capsule.unlockLocation,
          content: {
            text: capsule.content.text,
            mediaFiles: capsule.content.mediaFiles,
          },
          stats: capsule.stats,
          createdAt: capsule.createdAt,
          updatedAt: capsule.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Create capsule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
