import { Router } from 'express';
import { createPublicCapsule, getFeaturedPublicCapsules } from '../controllers/publicCapsulesController';


const router = Router();

// Get featured public capsules with pagination
router.get('/', getFeaturedPublicCapsules);

// Create a new public capsule (optional)
router.post('/', createPublicCapsule);

export default router;
