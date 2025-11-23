import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../supabase.js'
import { useDispatch } from 'react-redux'
import { signInSuccess } from '../redux/user/userSlice.js';

export default function Callback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      // Session ရှိမရှိစစ်ဆေးခြင်း
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        // User information ရယူခြင်း
        const userData = {
          email: session.user.email,
          name: session.user.user_metadata.user_name || 
                session.user.user_metadata.name || 
                session.user.user_metadata.full_name ||
                session.user.email.split('@')[0], // fallback
          googlePhotoUrl: session.user.user_metadata.avatar_url
        };        
        
        console.log('User Info:', userData);

        try {
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // ✅ Session အတွက် အရေးကြီးတယ်
            body: JSON.stringify({
              name: userData.name,
              email: userData.email,
              googlePhotoUrl: userData.googlePhotoUrl, // ✅ Field name မှန်အောင် ပြင်ပါ
            }),
          });
          
          const data = await res.json();
          console.log("Google OAuth response:", data);

          // ✅ Session Version: Response structure ပြောင်းသွားတယ်
          if (res.ok && data.success) {
            // ✅ data.user အောက်မှာ user information ရှိတယ်
            const userInfo = {
              _id: data.user._id,
              username: data.user.username,
              email: data.user.email,
              profilePicture: data.user.profilePicture,
              isAdmin: data.user.isAdmin,
              isEmailVerified: data.user.isEmailVerified,
            };
            
            dispatch(signInSuccess(userInfo));
            navigate('/');
          } else {
            console.error('Google OAuth failed:', data.message);
            // Error handling
            navigate('/sign-in');
          }
        } catch (error) {
          console.error('Network error:', error);
          navigate('/sign-in');
        }
      } else {
        // No session found
        console.error('No Supabase session found');
        navigate('/sign-in');
      }
    };

    getUser();
  }, [navigate, dispatch]);
}