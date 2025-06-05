import { Request, Response } from 'express';
import { Capsule } from '../models/Capsule';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { Media } from 'src/model';

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

interface CapsuleQuery {
  page?: string;
  limit?: string;
  status?: 'draft' | 'sealed' | 'unlocked' | 'expired';
  type?: 'personal' | 'group' | 'public';
  visibility?: 'private' | 'public' | 'unlisted';
  category?: string;
  tags?: string;
  creator?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'unlockDate' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export const createCapsule = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

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

    if (
      !content?.text?.trim() &&
      (!content?.mediaFiles || content.mediaFiles.length === 0)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Capsule must contain either text content or media files',
      });
    }

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

    const capsule = new Capsule(capsuleData);
    await capsule.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.capsulesCreated': 1 },
    });

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

export const getCapsules = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const {
      page = '1',
      limit = '10',
      status,
      type,
      visibility,
      category,
      tags,
      creator,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    }: CapsuleQuery = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {
      deletedAt: null,
    };

    filter.$or = [
      { creator: new mongoose.Types.ObjectId(userId) },
      { visibility: 'public' },
      { collaborators: new mongoose.Types.ObjectId(userId) },
    ];

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.type = type;
    }

    if (visibility) {
      filter.visibility = visibility;
    }

    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }

    if (tags) {
      const tagArray = tags.split(',').map((tag) => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    if (creator) {
      filter.creator = new mongoose.Types.ObjectId(creator);
    }

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [capsules, totalCount] = await Promise.all([
      Capsule.find(filter)
        .populate('creator', 'username firstName lastName avatar')
        .populate('collaborators', 'username firstName lastName avatar')
        .select('-unlockPassword') // Never expose passwords
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Capsule.countDocuments(filter),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.status(200).json({
      success: true,
      data: {
        capsules,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? pageNum + 1 : null,
          prevPage: hasPrevPage ? pageNum - 1 : null,
        },
      },
    });
  } catch (error) {
    console.error('Get capsules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getCapsuleById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Validate capsule ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid capsule ID',
      });
    }

    const capsule = await Capsule.findOne({
      _id: id,
      deletedAt: null,
    })
      .populate('creator', 'username firstName lastName avatar')
      .populate('collaborators', 'username firstName lastName avatar')
      .select('-unlockPassword'); // Never expose passwords

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found',
      });
    }

    const isCreator = capsule.creator._id.toString() === userId;
    const isCollaborator = capsule.collaborators.some(
      (collab: any) => collab._id.toString() === userId
    );
    const isPublic = capsule.visibility === 'public';

    if (!isCreator && !isCollaborator && !isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    let responseData: any = {
      _id: capsule._id,
      title: capsule.title,
      description: capsule.description,
      creator: capsule.creator,
      type: capsule.type,
      visibility: capsule.visibility,
      status: capsule.status,
      category: capsule.category,
      tags: capsule.tags,
      stats: capsule.stats,
      createdAt: capsule.createdAt,
      updatedAt: capsule.updatedAt,
    };

    // Add sensitive data only for creators and collaborators
    if (isCreator || isCollaborator) {
      responseData.collaborators = capsule.collaborators;
      responseData.maxCollaborators = capsule.maxCollaborators;
      responseData.unlockDate = capsule.unlockDate;
      responseData.passwordHint = capsule.passwordHint;
      responseData.unlockLocation = capsule.unlockLocation;
      responseData.sealedAt = capsule.sealedAt;
      responseData.unlockedAt = capsule.unlockedAt;
      responseData.expiresAt = capsule.expiresAt;
    }

    // Content visibility based on status and permissions
    if (capsule.status === 'unlocked' || isCreator || isCollaborator) {
      responseData.content = capsule.content;
    } else {
      // For sealed capsules, don't show content to non-owners
      responseData.content = {
        text: null,
        mediaFiles: [],
        attachedFunds: capsule.content.attachedFunds,
      };
    }

    // Add virtual fields
    responseData.timeRemaining = capsule.timeRemaining;
    responseData.isUnlockable = capsule.isUnlockable;

    // Increment view count (only for non-creators viewing)
    if (!isCreator) {
      await Capsule.findByIdAndUpdate(id, {
        $inc: { 'stats.views': 1 },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        capsule: responseData,
      },
    });
  } catch (error) {
    console.error('Get capsule by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const getMyCapsules = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const {
      page = '1',
      limit = '10',
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    }: Partial<CapsuleQuery> = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter: any = {
      creator: new mongoose.Types.ObjectId(userId),
      deletedAt: null,
    };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [capsules, totalCount] = await Promise.all([
      Capsule.find(filter)
        .populate('collaborators', 'username firstName lastName avatar')
        .select('-unlockPassword')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Capsule.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        capsules,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (error) {
    console.error('Get my capsules error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

export const deleteCapsule = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { confirm } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (confirm !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Confirmation required. Add ?confirm=true to your request',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid capsule ID',
      });
    }

    const capsule = await Capsule.findOne({
      _id: id,
      deletedAt: null,
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found or already deleted',
      });
    }

    if (capsule.creator.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only capsule creator can delete this capsule',
      });
    }

    capsule.deletedAt = new Date();
    await capsule.save();

    await Promise.all([
      Media.updateMany(
        { _id: { $in: capsule.content.mediaFiles } },
        { $set: { deletedAt: new Date() } }
      ),

      /* Comment.updateMany(
        { capsule: capsule._id },
        { $set: { deletedAt: new Date() } }
      ),
       */

      User.findByIdAndUpdate(userId, {
        $inc: { 'stats.capsulesCreated': -1 },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Capsule deleted successfully',
      data: {
        deletedAt: capsule.deletedAt,
      },
    });
  } catch (error) {
    console.error('Delete capsule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
