import express from 'express';
import controller from '../controllers/secretDrop/secretDrop.controller';

const secretDropRouter = (router: express.Router) => {
  router.get('/', controller.getCapsule);
  router.put('/:id', controller.getCapsule);
  router.delete('/:id', controller.getCapsule);
  router.put('/:id', controller.getCapsule);
  router.post('/secretDrop/unlock/:id', controller.unlockCapsule);
};

export default secretDropRouter;
