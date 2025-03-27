import { Router, Request, Response, NextFunction } from 'express';
import { Capsule } from '../model/capsule.model';

const router = Router();

router.get(
  '/legendary-capsules',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const legendaryCapsules = await Capsule.find({ legendary: true });

      if (!legendaryCapsules.length) {
        return res
          .status(404)
          .json({ message: 'No Legendary capsules found.' });
      }

      res.json(legendaryCapsules);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
