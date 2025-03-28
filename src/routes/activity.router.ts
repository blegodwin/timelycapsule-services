import express from 'express';
import { getActivityFeed } from '../controllers/activity.controller';

const router = express.Router();

router.get('/:userId/feed', getActivityFeed);

export default router;
