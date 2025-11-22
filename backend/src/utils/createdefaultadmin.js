import bcrypt from 'bcryptjs';
import User from '../models/user_model.js';
import { USERNAME, EMAIL, PASSWORD } from '../configs/config.js';

export const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ email: EMAIL });
    
    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync(PASSWORD, 10);
      
      // ✅ Create admin user with email verification fields
      await User.create({
        username: USERNAME,
        email: EMAIL,
        password: hashedPassword,
        profilePicture: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
        isAdmin: true,
        // ✅ Add email verification fields - Admin users are auto-verified
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });
      
      console.log('✅ Default admin user created successfully!');
    } else {
      // ✅ If admin already exists, ensure it's verified and update if needed
      if (!existingAdmin.isEmailVerified) {
        existingAdmin.isEmailVerified = true;
        existingAdmin.emailVerificationToken = null;
        existingAdmin.emailVerificationExpires = null;
        await existingAdmin.save();
        console.log('✅ Existing admin user email verification status updated!');
      }
      
      // ✅ Ensure the existing user has admin privileges
      if (!existingAdmin.isAdmin) {
        existingAdmin.isAdmin = true;
        await existingAdmin.save();
        console.log('✅ Existing user promoted to admin!');
      }
      
      console.log('ℹ️  Admin user already exists');
    }
  } catch (error) {
    console.log('❌ Error creating/updating admin user:', error.message);
  }
};