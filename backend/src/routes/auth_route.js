// routes/auth_route.js
import express from 'express';
import { 
  google, 
  signin, 
  signup, 
  verifyEmail, 
  resendVerificationEmail,
  forgotPassword,    
  resetPassword,
  signout,
  checkAuth
} from '../controllers/auth_controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/google', google);
router.post('/signout', signout); // ✅ Auth route ထဲကိုပါ ရွှေ့ထည့်မယ်
router.get('/check', checkAuth); // ✅ Auth status check

// Email verification routes
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;