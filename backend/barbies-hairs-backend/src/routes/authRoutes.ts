import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  refreshAccessToken,
} from '../controllers/authControlers.js';
import {
  uploadUserPhoto,
  resizeUserPhoto,
} from '../middlewares/uploadMiddleware.js';
import { protect } from '../middlewares/authmiddleware.js';

const router = express.Router();

router.post('/register', uploadUserPhoto, resizeUserPhoto, registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshAccessToken);
router.route('/me').get(protect, getMe);

export default router;
