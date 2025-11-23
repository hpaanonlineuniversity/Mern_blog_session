// controllers/user_controller.js
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../models/user_model.js';

export const test = (req, res) => {
  res.json({ message: 'API is working!' });
};

export const updateUser = async (req, res, next) => {
  // ✅ Session ကနေ user ID ကိုယူမယ်
  if (req.session.userId !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }

  try {
    const { username, email, profilePicture, password } = req.body;
    
    // ✅ လက်ရှိ user data ကို ရယူမယ်
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    // ✅ Build update object dynamically
    const updateData = {};

    // Username update
    if (username && username !== user.username) {
      if (username.length < 6 || username.length > 40) {
        return next(errorHandler(400, 'Username must be between 6 and 20 characters'));
      }
      if (username.includes(' ')) {
        return next(errorHandler(400, 'Username cannot contain spaces'));
      }
      if (username !== username.toLowerCase()) {
        return next(errorHandler(400, 'Username must be lowercase'));
      }
      if (!username.match(/^[a-zA-Z0-9]+$/)) {
        return next(errorHandler(400, 'Username can only contain letters and numbers'));
      }
      
      // Check if username already exists
      const existingUser = await User.findOne({ username });
      if (existingUser && existingUser._id.toString() !== req.params.userId) {
        return next(errorHandler(409, 'Username already taken'));
      }
      
      updateData.username = username;
    }

    // Email update
    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return next(errorHandler(400, 'Invalid email format'));
      }
      
      // Check if email already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser._id.toString() !== req.params.userId) {
        return next(errorHandler(409, 'Email already exists'));
      }
      
      updateData.email = email.toLowerCase();
    }

    // Profile picture update
    if (profilePicture !== undefined) {
      updateData.profilePicture = profilePicture;
    }

    // Password update - Only if provided and not empty
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return next(errorHandler(400, 'Password must be at least 6 characters'));
      }
      updateData.password = bcryptjs.hashSync(password, 10);
    }
    // ✅ If password is empty or not provided, keep the current password

    // ✅ If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return next(errorHandler(400, 'No fields to update'));
    }

    // ✅ Perform the update
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // ✅ Update session data
    if (updatedUser) {
      if (updateData.username) req.session.username = updatedUser.username;
      if (updateData.email) req.session.email = updatedUser.email;
    }

    // ✅ Prepare response without sensitive data
    const { password: _, ...userResponse } = updatedUser._doc;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return next(errorHandler(409, `${field} already exists`));
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return next(errorHandler(400, errors.join(', ')));
    }
    
    next(errorHandler(500, 'Internal server error'));
  }
};

export const deleteUser = async (req, res, next) => {
  // ✅ Session ကနေ admin status စစ်မယ်
  if (!req.session.isAdmin && req.session.userId !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this user'));
  }

  try {
    await User.findByIdAndDelete(req.params.userId);
    
    // ✅ ကိုယ့်ကိုယ်ကို delete လုပ်ရင် session ကိုလည်း destroy လုပ်မယ်
    if (req.session.userId === req.params.userId) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
      });
    }

    res.status(200).json('User has been deleted');
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  // ✅ Session ကနေ admin status စစ်မယ်
  if (!req.session.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to see all users'));
  }

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user._doc;
      return rest;
    });

    const totalUsers = await User.countDocuments();

    const now = new Date();
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      users: usersWithoutPassword,
      totalUsers,
      lastMonthUsers,
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const updateUserAdmin = async (req, res, next) => {
  try {
    // ✅ Session ကနေ admin status စစ်မယ်
    if (!req.session.isAdmin) {
      return next(errorHandler(403, 'You are not allowed to update admin status'));
    }

    // Prevent self-admin-status change
    if (req.session.userId === req.params.userId) {
      return next(errorHandler(403, 'You cannot change your own admin status'));
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        $set: {
          isAdmin: req.body.isAdmin
        },
      },
      { new: true }
    );

    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

// ✅ Get current user profile
export const getCurrentUser = async (req, res, next) => {
  try {
    if (!req.session.isLoggedIn) {
      return next(errorHandler(401, 'Not authenticated'));
    }

    const user = await User.findById(req.session.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }

    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};