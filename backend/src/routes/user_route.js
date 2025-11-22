// routes/user_route.js
import express from 'express';
import {
  deleteUser,
  getUser,
  getUsers,
  test,
  updateUser,
  updateUserAdmin,
  getCurrentUser
} from '../controllers/user_controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);

// Current user routes
router.get('/current', verifyToken, getCurrentUser); // ✅ Current user profile

// User management routes
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);

// Admin routes
router.get('/getusers', verifyToken, verifyAdmin, getUsers);
router.put('/update-admin/:userId', verifyToken, verifyAdmin, updateUserAdmin);

// Public route
router.get('/:userId', getUser);

export default router;