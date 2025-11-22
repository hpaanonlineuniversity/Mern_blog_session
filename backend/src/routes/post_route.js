// routes/post_route.js
import express from 'express';
import { verifyToken } from '../utils/verifyUser.js'; // ✅ Session verify သုံးမယ်
import { create, deletepost, getposts, updatepost } from '../controllers/post_controller.js';

const router = express.Router();

// ✅ Create post - Admin only
router.post('/create', verifyToken, create);

// ✅ Get posts - Public route (လူတိုင်းကြည့်လို့ရ)
router.get('/getposts', getposts);

// ✅ Delete post - Admin or post owner only
router.delete('/deletepost/:postId', verifyToken, deletepost); // ✅ userId parameter ဖြုတ်လိုက်တယ်

// ✅ Update post - Admin or post owner only  
router.put('/updatepost/:postId', verifyToken, updatepost); // ✅ userId parameter ဖြုတ်လိုက်တယ်

export default router;