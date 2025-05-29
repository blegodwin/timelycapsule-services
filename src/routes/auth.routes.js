const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  register,
  login,
  getMe,
  updateMe,
  deleteMe
} = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/me', updateMe);
router.delete('/me', deleteMe);

module.exports = router; 