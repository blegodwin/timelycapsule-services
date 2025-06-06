//routes/mediaRoutes.ts
import express from "express";
import {
  listCapsuleMedia,
  deleteCapsuleMedia,
  getMediaMetadata,
  streamMedia,
  uploadMedia,
} from "../controllers/MediaController";

const router = express.Router();

router.post("/capsules/:id/media", uploadMedia);

router.get("/capsules/:id/media", listCapsuleMedia);

router.delete("/capsules/:id/media/:mediaId", deleteCapsuleMedia);

router.get("/media/:id", getMediaMetadata);

router.get("/media/:id/stream", streamMedia);

export default router;
