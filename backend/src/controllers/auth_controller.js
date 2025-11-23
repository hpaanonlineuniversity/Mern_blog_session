// controllers/auth_controller.js
import User from '../models/user_model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';


export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // 1. Input validation (အရင်အတိုင်းပဲ)
    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return next(errorHandler(400, 'All fields are required'));
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return next(errorHandler(400, 'Invalid email format'));
    }

    if (password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters long'));
    }

    // 2. Check existing user
    const existingUser = await User.findOne({
      $or: [
        { email: email.trim().toLowerCase() },
        { username: username.trim().toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.trim().toLowerCase()) {
        return next(errorHandler(409, 'Email already exists'));
      }
      if (existingUser.username === username.trim().toLowerCase()) {
        return next(errorHandler(409, 'Username already taken'));
      }
    }

    // 3. Hash password
    const hashedPassword = bcryptjs.hashSync(password, 12);

    // 4. Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 5. Create new user
    const newUser = new User({
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires,
    });

    await newUser.save();

    // 6. Send verification email
    try {
      await sendVerificationEmail(newUser.email, emailVerificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    // 9. Send success response
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification link.',
    });

  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(errorHandler(409, `${field} already exists`));
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return next(errorHandler(400, errors.join(', ')));
    }

    next(errorHandler(500, 'Internal server error during signup'));
  }
};


// ✅ Email verification controller
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(errorHandler(400, 'Verification token is required'));
    }

    // Find user by verification token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() } // Token hasn't expired
    });

    if (!user) {
      return next(errorHandler(400, 'Invalid or expired verification token'));
    }

    // Update user as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now sign in.',
    });
  } catch (error) {
    next(errorHandler(500, 'Error verifying email'));
  }
};

// ✅ Resend verification email controller
export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(errorHandler(400, 'Email is required'));
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    if (user.isEmailVerified) {
      return next(errorHandler(400, 'Email is already verified'));
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update user with new token
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, emailVerificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your email.',
    });
  } catch (error) {
    next(errorHandler(500, 'Error resending verification email'));
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password || email === '' || password === '') {
    return next(errorHandler(400, 'All fields are required'));
  }

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, 'User not found'));
    }

    // ✅ Check if email is verified
    if (!validUser.isEmailVerified) {
      return next(errorHandler(403, 'Please verify your email before signing in'));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(400, 'Invalid password'));
    }

    // ✅ Session မှာ user information သိမ်းမယ်
    req.session.userId = validUser._id.toString();
    req.session.username = validUser.username;
    req.session.email = validUser.email;
    req.session.isAdmin = validUser.isAdmin;
    req.session.isLoggedIn = true;

    //const { password: pass, ...rest } = validUser._doc;
    const { password: _, emailVerificationToken: __, emailVerificationExpires: ___, ...userWithoutSensitiveData } = validUser._doc;

    // ✅ Cookie မှာ token မထည့်တော့ဘူး
    res.status(200).json({
      success: true,
      message: 'Signin successful',
      user: userWithoutSensitiveData
    });
  } catch (error) {
    next(error);
  }
};

export const google = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      // ✅ Google user တွေကို auto-verify လုပ်မယ်
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
      }

      // ✅ Session မှာ user information သိမ်းမယ်
      req.session.userId = user._id.toString();
      req.session.username = user.username;
      req.session.email = user.email;
      req.session.isAdmin = user.isAdmin;
      req.session.isLoggedIn = true;

      //const { password, ...rest } = user._doc;
      const { password: _, emailVerificationToken: __, emailVerificationExpires: ___, ...userWithoutSensitiveData } = user._doc;

      res.status(200).json({
        success: true,
        message: 'Google signin successful',
        user: userWithoutSensitiveData
      });
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username: name.toLowerCase().split(' ').join('') + Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword,
        profilePicture: googlePhotoUrl,
        isEmailVerified: true,
      });
      await newUser.save();

      // ✅ Session မှာ user information သိမ်းမယ်
      req.session.userId = newUser._id.toString();
      req.session.username = newUser.username;
      req.session.email = newUser.email;
      req.session.isAdmin = newUser.isAdmin;
      req.session.isLoggedIn = true;

      //const { password, ...rest } = newUser._doc;
      const { password: _, emailVerificationToken: __, emailVerificationExpires: ___, ...userWithoutSensitiveData } = newUser._doc;
      res.status(200).json({
        success: true,
        message: 'Google signin successful',
        user: userWithoutSensitiveData
      });
    }
  } catch (error) {
    next(error);
  }
};

// controllers/auth_controller.js
export const signout = async (req, res, next) => {
  try {
    // Session destroy လုပ်မယ်
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return next(errorHandler(500, 'Could not sign out'));
      }
      
      // ✅ Cookie clear လုပ်မယ် - Session name ကိုသုံးမယ်
      res.clearCookie('sessionId', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax'
      });
      
      res.status(200).json({
        success: true,
        message: 'Signed out successfully'
      });
    });
  } catch (error) {
    console.error('Signout error:', error);
    next(errorHandler(500, 'Error during signout'));
  }
};

// ✅ Forgot Password - Reset token ပို့ပေးမယ်
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return next(errorHandler(400, 'Email is required'));
    }

    // User ရှိမရှိ စစ်မယ်
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) {
      // Security အတွက် user မရှိရင်လည်း success response ပြန်ပေးမယ်
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
    }

    // Password reset token generate လုပ်မယ်
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // User ကို update လုပ်မယ်
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Reset email ပို့မယ်
    try {
      await sendPasswordResetEmail(user.email, resetToken);
      
      res.status(200).json({
        success: true,
        message: 'Password reset link has been sent to your email.',
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
      return next(errorHandler(500, 'Failed to send reset email'));
    }

  } catch (error) {
    next(errorHandler(500, 'Error in forgot password'));
  }
};

// ✅ Reset Password - New password သတ်မှတ်မယ်
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(errorHandler(400, 'Token and new password are required'));
    }

    // Password strength check
    if (newPassword.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters'));
    }

    // Token valid ဖြစ်မဖြစ် စစ်မယ်
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() } // Token မသက်တမ်းမကုန်သေး
    });

    if (!user) {
      return next(errorHandler(400, 'Invalid or expired reset token'));
    }

    // New password hash လုပ်မယ်
    const hashedPassword = bcryptjs.hashSync(newPassword, 12);

    // User update လုပ်မယ်
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
    });

  } catch (error) {
    next(errorHandler(500, 'Error resetting password'));
  }
};

// ✅ Check auth status
export const checkAuth = async (req, res, next) => {
  try {
    if (req.session.isLoggedIn) {
      // User logged in, get fresh data from database
      const user = await User.findById(req.session.userId);
      if (!user) {
        return next(errorHandler(404, 'User not found'));
      }

      const { password, ...userWithoutPassword } = user._doc;
      res.status(200).json({
        success: true,
        isAuthenticated: true,
        user: userWithoutPassword
      });
    } else {
      // User not logged in
      res.status(200).json({
        success: true,
        isAuthenticated: false,
        user: null
      });
    }
  } catch (error) {
    next(errorHandler(500, 'Error checking authentication status'));
  }
};