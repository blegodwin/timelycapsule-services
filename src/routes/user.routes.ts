import express from 'express';
import { checkRole } from '../middleware/checkRole';
import { authenticate } from '../middleware/authMiddleware';
import * as userController from '../controllers/userController';
import { UserRole } from '../models/user.model';


export default (router: express.Router) => {

  
  router.get('/users/me', authenticate, userController.getSelf);   
  router.patch('/users/me', authenticate, userController.updateSelf);

  router.get('/users', authenticate, checkRole(UserRole.ADMIN), userController.getUsers);
  router.get('/users/:id', authenticate, checkRole(UserRole.ADMIN), userController.getUserById);
  router.patch('/users/:id', authenticate, checkRole(UserRole.ADMIN), userController.updateUser);
  router.delete('/users/:id', authenticate, checkRole(UserRole.ADMIN), userController.deleteUser);

 
};
