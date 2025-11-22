import { Alert, Button, Card, Spinner } from 'flowbite-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail(token);
    } else {
      setMessage('Invalid verification link');
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setIsSuccess(true);
      } else {
        setMessage(data.message || 'Verification failed');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
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

          {/* Verification Status Card */}
          <Card>
            <div className='text-center'>
              {isLoading ? (
                <>
                  <Spinner size='xl' className='mb-4' />
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
                    Verifying Your Email...
                  </h2>
                  <p className='text-gray-600 dark:text-gray-400'>
                    Please wait while we verify your email address.
                  </p>
                </>
              ) : (
                <>
                  <div className={`text-6xl mb-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                    {isSuccess ? '✅' : '❌'}
                  </div>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                    {isSuccess ? 'Email Verified!' : 'Verification Failed'}
                  </h2>
                  
                  <Alert color={isSuccess ? 'success' : 'failure'} className='mb-4'>
                    {message}
                  </Alert>

                  <div className='flex flex-col gap-2 mt-6'>
                    {isSuccess ? (
                      <Button
                        color="purple"
                        onClick={() => navigate('/sign-in')}
                        className='w-full'
                      >
                        Continue to Sign In
                      </Button>
                    ) : (
                      <Button
                        color="gray"
                        onClick={() => navigate('/sign-up')}
                        className='w-full'
                      >
                        Back to Sign Up
                      </Button>
                    )}
                    <Link to='/'>
                      <Button color="light" className='w-full'>
                        Go to Homepage
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}