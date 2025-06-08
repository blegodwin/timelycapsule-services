import { Request, Response } from 'express';
import { Capsule } from '../models/Capsule';
import { Contribution } from '../models/Contribution';
import { Media } from '../models/Media';
import { Collaboration } from '../models/Collaboration'; // Import collaboration model
import mongoose from 'mongoose';

export const createContribution = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const capsuleId = req.params.id;
    const { text, mediaFiles = [], previousVersionId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid capsule ID',
      });
    }

    const capsule = await Capsule.findOne({
      _id: capsuleId,
      deletedAt: null,
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'Capsule not found',
      });
    }

    // Verify capsule is group type
    if (capsule.type !== 'group') {
      return res.status(400).json({
        success: false,
        message: 'Contributions only allowed for group capsules',
      });
    }

    // Check user's collaboration status and permissions
    const collaboration = await Collaboration.findOne({
      capsule: capsuleId,
      user: userId,
      status: 'accepted',
    });

    if (!collaboration) {
      return res.status(403).json({
        success: false,
        message: 'You are not an accepted collaborator on this capsule',
      });
    }

    // Check if user has permission to contribute
    if (!collaboration.permissions.canAddMedia && mediaFiles.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add media to this capsule',
      });
    }

    if (text && !collaboration.permissions.canEditContent) {
      return res.status(403).json({
        success: false,
        message:
          'You do not have permission to add text content to this capsule',
      });
    }

    // Check media files exist
    if (mediaFiles.length > 0) {
      const validMedia = await Media.countDocuments({
        _id: { $in: mediaFiles },
        deletedAt: null,
        uploadedBy: userId, // Ensure user owns the media
      });

      if (validMedia !== mediaFiles.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more media files not found or not owned by you',
        });
      }
    }

    // Handle versioning
    let previousVersion = null;
    if (previousVersionId) {
      if (!mongoose.Types.ObjectId.isValid(previousVersionId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid previous version ID',
        });
      }

      previousVersion = await Contribution.findOne({
        _id: previousVersionId,
        capsule: capsuleId,
        author: userId,
      });

      if (!previousVersion) {
        return res.status(404).json({
          success: false,
          message: 'Previous contribution version not found',
        });
      }
    }

    // Create contribution
    const contribution = new Contribution({
      capsule: capsuleId,
      author: userId,
      content: {
        text: text?.trim(),
        mediaFiles,
      },
      previousVersion: previousVersionId,
    });

    await contribution.save();

    // Add to capsule's contributions
    capsule.contributions.push(contribution._id);
    await capsule.save();

    res.status(201).json({
      success: true,
      message: 'Contribution submitted for approval',
      data: {
        contribution: {
          _id: contribution._id,
          status: contribution.status,
          version: contribution.version,
          createdAt: contribution.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('Create contribution error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create contribution',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
