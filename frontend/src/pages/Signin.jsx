import { Alert, Button, Label, Spinner, TextInput, Card } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import OAuth from '../components/OAuth';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
  clearError,
  clearVerification,
  resendVerificationStart,
  resendVerificationSuccess,
  resendVerificationFailure,
  initializeVerificationState,
} from '../redux/user/userSlice';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [showResendOption, setShowResendOption] = useState(false);
  
  // ✅ FIX: Safe state access with default values
  const { 
    loading, 
    error: errorMessage,
    verification 
  } = useSelector((state) => state.user);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Initialize verification state on component mount
  useEffect(() => {
    dispatch(clearError());
    dispatch(initializeVerificationState());
    dispatch(clearVerification());
  }, [dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
    // Reset resend option when user types
    if (showResendOption) {
      setShowResendOption(false);
      dispatch(clearVerification());
    }
    // Clear error when user starts typing
    if (errorMessage) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return dispatch(signInFailure('Please fill all the fields'));
    }
    
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();

      console.log('Signin response:', data);

      if (data.success === false) {
        // ✅ Check if it's an email verification error
        if (data.message && (
          data.message.includes('verify your email') || 
          data.message.includes('email verification') ||
          data.message.includes('Please verify')
        )) {
          setShowResendOption(true);
        }
        dispatch(signInFailure(data.message));
      }

      if (res.ok) {
        // User data ကို clear ဖြစ်အောင် format လုပ်ပါ
        const userData = {
          _id: data._id,
          username: data.username,
          email: data.email,
          profilePicture: data.profilePicture,
          isAdmin: data.isAdmin,
          isEmailVerified: data.isEmailVerified,
        };
        dispatch(signInSuccess(userData));
        navigate('/');
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      return dispatch(resendVerificationFailure('Please enter your email address first.'));
    }

    try {
      dispatch(resendVerificationStart());

      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(resendVerificationSuccess('✅ Verification email sent! Please check your inbox and spam folder.'));
        // Auto hide after 5 seconds
        setTimeout(() => {
          setShowResendOption(false);
        }, 5000);
      } else {
        dispatch(resendVerificationFailure(data.message || 'Failed to resend verification email.'));
      }
    } catch (error) {
      dispatch(resendVerificationFailure('Network error. Please try again.'));
    }
  };

  const handleCloseResendOption = () => {
    setShowResendOption(false);
    dispatch(clearVerification());
  };

  // ✅ FIX: Safe access to verification properties with fallbacks
  const verificationMessage = verification?.message || '';
  const verificationSuccess = verification?.success || false;
  const verificationLoading = verification?.loading || false;

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4'>
      <div className='flex justify-center items-center'>
        <div className='max-w-md w-full'>
          {/* Header Card */}
          <Card className='mb-8 text-center'>
            <div className='flex justify-center mb-4'>
              <Link to='/' className='flex items-center gap-2'>
                <span className='px-3 py-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white text-2xl font-bold'>
                  Hpa-an's
                </span>
                <span className='text-xl font-semibold dark:text-white'>
                  Blog
                </span>
              </Link>
            </div>
            <a 
              href='https://github.com/hpaanonlineuniversity'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-block mt-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline transition-colors'
            >
              Join our community on GitHub →
            </a>
          </Card>

          {/* Resend Verification Card */}
          {showResendOption && (
            <Card className='mb-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'>
              <div className='text-center'>
                <h3 className='text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2'>
                  📧 Email Verification Required
                </h3>
                <p className='text-blue-700 dark:text-blue-400 mb-4 text-sm'>
                  Your email needs to be verified before you can sign in.
                </p>
                
                {verificationMessage ? (
                  <Alert 
                    color={verificationSuccess ? 'success' : 'failure'} 
                    className='mb-3'
                  >
                    {verificationMessage}
                  </Alert>
                ) : (
                  <div className='flex flex-col gap-2'>
                    <Button
                      color="blue"
                      onClick={handleResendVerification}
                      disabled={verificationLoading}
                      size="sm"
                      className='w-full'
                    >
                      {verificationLoading ? (
                        <>
                          <Spinner size='sm' />
                          <span className='pl-2'>Sending...</span>
                        </>
                      ) : (
                        'Resend Verification Email'
                      )}
                    </Button>
                    <Button
                      color="light"
                      onClick={handleCloseResendOption}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Sign In Form Card */}
          <Card>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Welcome Back
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Sign in to your account
              </p>
            </div>

            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <Label htmlFor='email' value='Email Address' />
                <TextInput
                  type='email'
                  placeholder='name@company.com'
                  id='email'
                  onChange={handleChange}
                  required
                  shadow
                />
              </div>
              
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <Label htmlFor='password' value='Password' />
                  <Link 
                    to='/forgot-password'
                    className='text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline'
                  >
                    Forgot password?
                  </Link>
                </div>
                <TextInput
                  type='password'
                  placeholder='Enter your password'
                  id='password'
                  onChange={handleChange}
                  required
                  shadow
                />
              </div>

              <Button
                color="purple"
                type='submit'
                disabled={loading}
                className='w-full mt-2'
                size='lg'
              >
                {loading ? (
                  <>
                    <Spinner size='sm' />
                    <span className='pl-3'>Signing In...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className='flex items-center my-6'>
              <div className='flex-1 border-t border-gray-300 dark:border-gray-600'></div>
              <span className='px-3 text-gray-500 dark:text-gray-400 text-sm'>Or continue with</span>
              <div className='flex-1 border-t border-gray-300 dark:border-gray-600'></div>
            </div>

            {/* OAuth Section */}
            <OAuth/>

            {/* Sign Up Link */}
            <div className='text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
              <span className='text-gray-600 dark:text-gray-400'>
                Don't have an account?{' '}
                <Link 
                  to='/sign-up' 
                  className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium'
                >
                  Sign Up
                </Link>
              </span>
            </div>

            {/* Email Verification Help */}
            <div className='text-center mt-4'>
              <p className='text-xs text-gray-500 dark:text-gray-400'>
                Didn't receive verification email?{' '}
                <button
                  onClick={() => setShowResendOption(true)}
                  className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 hover:underline'
                >
                  Click here to resend
                </button>
              </p>
            </div>
          </Card>

          {/* Error Message */}
          {errorMessage && !showResendOption && (
            <Alert className='mt-4' color='failure'>
              <span className='font-medium'>Sign in failed!</span> {errorMessage}
            </Alert>
          )}

          {/* Global Verification Message (for success cases) */}
          {verificationMessage && !showResendOption && (
            <Alert 
              className='mt-4' 
              color={verificationSuccess ? 'success' : 'failure'}
            >
              {verificationMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}