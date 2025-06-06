//src/controllers/MediaController.ts

import { Request, Response } from "express";
import { Media } from "../models/Media";
import { Capsule } from "../models/Capsule";
import mongoose from "mongoose";
import {
  upload,
  generateThumbnail,
  extractMetadata,
  s3,
} from "../config/multerConfig";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const uploadMedia = [
  upload.array("media", 10),

  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const capsuleId = req.params.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid capsule ID",
        });
      }

      const capsule = await Capsule.findOne({
        _id: capsuleId,
        deletedAt: null,
      });

      if (!capsule) {
        return res.status(404).json({
          success: false,
          message: "Capsule not found",
        });
      }

      const isCreator = capsule.creator.toString() === userId;
      const isCollaborator = capsule.collaborators.some(
        (c: any) => c.toString() === userId
      );

      if (!isCreator && !isCollaborator) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to add media to this capsule",
        });
      }

      const files = req.files as Express.MulterS3.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const mediaItems = await Promise.all(
        files.map(async (file) => {
          const metadata = await extractMetadata(file);

          const thumbnailBuffer = await generateThumbnail(file);
          let thumbnailKey = null;

          if (thumbnailBuffer) {
            thumbnailKey = `thumbnails/${uuidv4()}.jpg`;
            await s3.send(
              new PutObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: thumbnailKey,
                Body: thumbnailBuffer,
                ContentType: "image/jpeg",
              })
            );
          }

          const media = new Media({
            capsule: capsuleId,
            uploadedBy: userId,
            fileName: file.key,
            originalName: file.originalname,
            mimeType: file.mimetype,
            fileSize: file.size,
            filePath: file.location,
            thumbnail: thumbnailKey,
            metadata,
            processingStatus: "completed",
          });

          return media.save();
        })
      );

      const mediaIds = mediaItems.map((media) => media._id);
      capsule.content.mediaFiles.push(...mediaIds);
      await capsule.save();

      res.status(201).json({
        success: true,
        message: "Media uploaded successfully",
        data: {
          media: mediaItems.map((m) => ({
            _id: m._id,
            fileName: m.fileName,
            originalName: m.originalName,
            mimeType: m.mimeType,
            fileSize: m.fileSize,
            thumbnail: m.thumbnail,
            metadata: m.metadata,
          })),
        },
      });
    } catch (error) {
      console.error("Media upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload media",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];

export const listCapsuleMedia = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const capsuleId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(capsuleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid capsule ID",
      });
    }

    const capsule = await Capsule.findOne({
      _id: capsuleId,
      deletedAt: null,
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: "Capsule not found",
      });
    }

    const isCreator = capsule.creator.toString() === userId;
    const isCollaborator = capsule.collaborators.some(
      (c: any) => c.toString() === userId
    );
    const isPublic = capsule.visibility === "public";

    if (!isCreator && !isCollaborator && !isPublic) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this capsule",
      });
    }

    const media = await Media.find({ capsule: capsuleId })
      .select(
        "fileName originalName mimeType fileSize thumbnail metadata createdAt"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        media,
      },
    });
  } catch (error) {
    console.error("List media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve media",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const deleteCapsuleMedia = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const capsuleId = req.params.id;
    const mediaId = req.params.mediaId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(capsuleId) ||
      !mongoose.Types.ObjectId.isValid(mediaId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid capsule or media ID",
      });
    }

    const capsule = await Capsule.findOne({
      _id: capsuleId,
      deletedAt: null,
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: "Capsule not found",
      });
    }

    const isCreator = capsule.creator.toString() === userId;
    const isCollaborator = capsule.collaborators.some(
      (c: any) => c.toString() === userId
    );

    if (!isCreator && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete media from this capsule",
      });
    }

    const media = await Media.findOne({
      _id: mediaId,
      capsule: capsuleId,
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found in this capsule",
      });
    }

    capsule.content.mediaFiles = capsule.content.mediaFiles.filter(
      (id: mongoose.Types.ObjectId) => id.toString() !== mediaId
    );

    await capsule.save();

    await Media.deleteOne({ _id: mediaId });

    await Media.findByIdAndUpdate(mediaId, {
      $set: { processingStatus: "pending_deletion" },
    });

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete media",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const getMediaMetadata = async (req: Request, res: Response) => {
  try {
    const mediaId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    const media = await Media.findById(mediaId).select(
      "fileName originalName mimeType fileSize thumbnail metadata createdAt"
    );

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        media,
      },
    });
  } catch (error) {
    console.error("Get media metadata error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve media metadata",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const streamMedia = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const mediaId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(mediaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid media ID",
      });
    }

    const media = await Media.findById(mediaId);

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    //src/controllers/MediaController.ts
    const capsule = await Capsule.findOne({
      _id: media.capsule,
      deletedAt: null,
    });

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: "Capsule not found",
      });
    }

    //src/controllers/MediaController.ts
    const isCreator = capsule.creator.toString() === userId;
    const isCollaborator = capsule.collaborators.some(
      (c: any) => c.toString() === userId
    );
    const isPublic = capsule.visibility === "public";

    if (!isPublic && !isCreator && !isCollaborator) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this media",
      });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: media.fileName,
      ResponseContentDisposition: `inline; filename="${media.originalName}"`,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); //src/controllers/MediaController.ts

    res.status(200).json({
      success: true,
      data: {
        streamUrl: url,
      },
    });
  } catch (error) {
    console.error("Stream media error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate media stream URL",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
