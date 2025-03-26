import { Router } from 'express';
import { createPublicCapsule, getFeaturedPublicCapsules } from '../controllers/publicCapsulesController';


const publicRouter = (router: Router) => {
  router.get('/', getFeaturedPublicCapsules);
  router.post('/', createPublicCapsule);
}

export default publicRouter