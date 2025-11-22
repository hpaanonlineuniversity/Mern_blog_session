// routes/comment_route.js
import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
  createComment,
  deleteComment,
  editComment,
  getPostComments,
  getcomments,
  likeComment,
} from '../controllers/comment_controller.js';

const router = express.Router();

// ✅ Create comment - Logged in users only
router.post('/create', verifyToken, createComment);

// ✅ Get comments for a post - Public route
router.get('/getPostComments/:postId', getPostComments);

// ✅ Like comment - Logged in users only
router.put('/likeComment/:commentId', verifyToken, likeComment);

// ✅ Edit comment - Comment owner or admin only
router.put('/editComment/:commentId', verifyToken, editComment);

// ✅ Delete comment - Comment owner or admin only
router.delete('/deleteComment/:commentId', verifyToken, deleteComment);

// ✅ Get all comments - Admin only
router.get('/getcomments', verifyToken, getcomments);

export default router;