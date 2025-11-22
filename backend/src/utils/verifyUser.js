// utils/verifyUser.js (Session Version)
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
  // ✅ Session ကနေ authentication status စစ်မယ်
  if (!req.session.isLoggedIn) {
    return next(errorHandler(401, 'Unauthorized - Please sign in'));
  }
  
  // Session ရှိရင် next() ဆက်ခေါ်မယ်
  next();
};

export const verifyAdmin = (req, res, next) => {
  // ✅ Session ကနေ admin status စစ်မယ်
  if (!req.session.isLoggedIn) {
    return next(errorHandler(401, 'Unauthorized - Please sign in'));
  }
  
  if (!req.session.isAdmin) {
    return next(errorHandler(403, 'Forbidden - Admin access required'));
  }
  
  next();
};