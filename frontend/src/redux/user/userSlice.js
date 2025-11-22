//userSlice.js

import { createSlice } from '@reduxjs/toolkit';

// ✅ FIX: Proper initial state with verification object
const initialState = {
  currentUser: null,
  loading: false,
  error: null, // Changed from false to null for consistency
  verification: {
    loading: false,
    message: null,
    success: false,
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    // ✅ FIX: Clear verification messages properly
    clearVerification: (state) => {
      if (state.verification) {
        state.verification.loading = false;
        state.verification.message = null;
        state.verification.success = false;
      }
    },
    
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    signInSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    updateUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    updateUserSuccess: (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    updateUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteUserStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    deleteUserSuccess: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
      // ✅ Reset verification state on delete
      if (state.verification) {
        state.verification.loading = false;
        state.verification.message = null;
        state.verification.success = false;
      }
    },
    
    deleteUserFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    signOut: (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
      // ✅ Reset verification state on signout
      if (state.verification) {
        state.verification.loading = false;
        state.verification.message = null;
        state.verification.success = false;
      }
    },

    // ✅ FIX: Email verification reducers with proper state access
    resendVerificationStart: (state) => {
      if (!state.verification) {
        state.verification = {
          loading: true,
          message: null,
          success: false,
        };
      } else {
        state.verification.loading = true;
        state.verification.message = null;
        state.verification.success = false;
      }
    },
    
    resendVerificationSuccess: (state, action) => {
      if (state.verification) {
        state.verification.loading = false;
        state.verification.message = action.payload;
        state.verification.success = true;
      }
    },
    
    resendVerificationFailure: (state, action) => {
      if (state.verification) {
        state.verification.loading = false;
        state.verification.message = action.payload;
        state.verification.success = false;
      }
    },

    // ✅ Update email verification status
    updateEmailVerificationStatus: (state, action) => {
      if (state.currentUser) {
        state.currentUser.isEmailVerified = action.payload;
      }
    },

    // ✅ Set verification message (for external components)
    setVerificationMessage: (state, action) => {
      if (!state.verification) {
        state.verification = {
          loading: false,
          message: action.payload.message,
          success: action.payload.success || false,
        };
      } else {
        state.verification.message = action.payload.message;
        state.verification.success = action.payload.success || false;
      }
    },

    // ✅ Initialize verification state if missing
    initializeVerificationState: (state) => {
      if (!state.verification) {
        state.verification = {
          loading: false,
          message: null,
          success: false,
        };
      }
    },
  },
});

export const {
  signInStart,
  signInSuccess,
  signInFailure,
  clearError,
  clearVerification,
  updateUserFailure,
  updateUserSuccess,
  signOut,
  updateUserStart,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  // ✅ Export new verification reducers
  resendVerificationStart,
  resendVerificationSuccess,
  resendVerificationFailure,
  updateEmailVerificationStatus,
  setVerificationMessage,
  initializeVerificationState,
} = userSlice.actions;

export default userSlice.reducer;