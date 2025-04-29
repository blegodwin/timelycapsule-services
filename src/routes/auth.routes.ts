import { Router } from 'express';
import { register, login, logout, guest, refresh } from '../controllers/auth.controller';
import { registerValidation, loginValidation } from '../utils/validators';

const router = Router();

export default (): Router => {
  router.post('/register', registerValidation, register);
  router.post('/login', loginValidation, login);
  router.post('/logout', logout);
  router.post('/guest', guest);
  router.post('/refresh', refresh);
  return router;
};
