import { Router } from 'express';
import { register, login, logout, guest, forgotPassword, resetPassword, upgradeGuest } from '../controllers/auth.controller';
import { registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation, upgradeGuestValidation } from '../utils/validators';
import { authenticateToken } from '../middleware/auth';

const router = Router();

export default (): Router => {
  router.post('/register', registerValidation, register);
  router.post('/login', loginValidation, login);
  router.post('/logout', logout);
  router.post('/guest', guest);
  router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
  router.post('/reset-password', resetPasswordValidation, resetPassword);
  router.post('/upgrade', authenticateToken, upgradeGuestValidation, upgradeGuest);
  return router;
};
