// pages/ResetPassword.jsx
import { Alert, Button, Label, Spinner, TextInput, Card } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      return setError('Please fill in all fields');
    }

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Password reset successfully!');
        
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          navigate('/sign-in');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.');
        if (data.message?.includes('expired') || data.message?.includes('invalid')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4'>
        <div className='flex justify-center items-center'>
          <div className='max-w-md w-full'>
            <Card className='text-center'>
              <div className='text-6xl mb-4'>🔒</div>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                Invalid Reset Link
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mb-6'>
                This password reset link is invalid or has expired.
              </p>
              <div className='space-y-3'>
                <Link to='/forgot-password'>
                  <Button color="purple" className='w-full'>
                    Request New Reset Link
                  </Button>
                </Link>
                <Link to='/sign-in'>
                  <Button color="light" className='w-full'>
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
          </Card>

          {/* Reset Password Form Card */}
          <Card>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Reset Password
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Create your new password
              </p>
            </div>

            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <Label htmlFor='newPassword' value='New Password' />
                <TextInput
                  type='password'
                  placeholder='At least 6 characters'
                  id='newPassword'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  shadow
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirmPassword' value='Confirm Password' />
                <TextInput
                  type='password'
                  placeholder='Re-enter your password'
                  id='confirmPassword'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
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
                    <span className='pl-3'>Resetting Password...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>
            </form>

            {/* Success Message */}
            {message && (
              <Alert className='mt-4' color='success'>
                <span className='font-medium'>Success!</span> {message}
                <div className='mt-2 text-sm'>
                  Redirecting to sign in page...
                </div>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert className='mt-4' color='failure'>
                <span className='font-medium'>Error!</span> {error}
              </Alert>
            )}

            {/* Password Requirements */}
            <div className='mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                🔐 Password Requirements
              </h4>
              <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                <li>• At least 6 characters long</li>
                <li>• Use a combination of letters and numbers</li>
                <li>• Avoid common passwords</li>
              </ul>
            </div>

            {/* Back to Sign In Link */}
            <div className='text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
              <span className='text-gray-600 dark:text-gray-400'>
                Remember your password?{' '}
                <Link 
                  to='/sign-in' 
                  className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium'
                >
                  Sign In
                </Link>
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}