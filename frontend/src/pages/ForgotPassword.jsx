// pages/ForgotPassword.jsx
import { Alert, Button, Label, Spinner, TextInput, Card } from 'flowbite-react';
import { useState } from 'react';
import { Link } from 'react-router';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return setError('Please enter your email address');
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Password reset link has been sent to your email.');
        setEmail('');
      } else {
        setError(data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Forgot Password Form Card */}
          <Card>
            <div className='text-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Forgot Password
              </h2>
              <p className='text-gray-600 dark:text-gray-400 mt-2'>
                Enter your email to reset your password
              </p>
            </div>

            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
              <div className='space-y-2'>
                <Label htmlFor='email' value='Email Address' />
                <TextInput
                  type='email'
                  placeholder='name@company.com'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    <span className='pl-3'>Sending Reset Link...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>

            {/* Success Message */}
            {message && (
              <Alert className='mt-4' color='success'>
                <span className='font-medium'>Success!</span> {message}
                <div className='mt-2 text-sm'>
                  📧 Check your inbox and spam folder for the reset link.
                </div>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert className='mt-4' color='failure'>
                <span className='font-medium'>Error!</span> {error}
              </Alert>
            )}

            {/* Help Text */}
            <div className='mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <h4 className='font-semibold text-gray-900 dark:text-white mb-2'>
                🔒 What happens next?
              </h4>
              <ul className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                <li>• Check your email for a password reset link</li>
                <li>• The link will expire in 1 hour</li>
                <li>• Follow the instructions in the email</li>
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