import { Alert, Button, Label, Spinner, TextInput, Card } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      return setErrorMessage('Please fill out all fields.');
    }

    // Password length validation
    if (formData.password.length < 6) {
      return setErrorMessage('Password must be at least 6 characters long.');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return setErrorMessage('Please enter a valid email address.');
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return setErrorMessage(data.message || 'Something went wrong!');
      }
      
      if (data.success) {
        setSuccessMessage(data.message);
        setShowVerificationNotice(true);
        // Auto redirect မလုပ်တော့ဘူး၊ user ကို verification notice ပြမယ်
      }
      
    } catch (error) {
      setErrorMessage(error.message || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!formData.email) {
      return setErrorMessage('Email is required to resend verification.');
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        return setErrorMessage(data.message || 'Failed to resend verification email.');
      }
      
      setSuccessMessage('Verification email sent successfully! Please check your inbox.');
      
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
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
            <a 
              href='https://github.com/hpaanonlineuniversity'
              className='text-purple-600 hover:text-purple-700 hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            >
              Join our community on GitHub
            </a>
          </Card>

          {/* Email Verification Notice */}
          {showVerificationNotice && (
            <Card className='mb-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20'>
              <div className='text-center'>
                <h3 className='text-lg font-semibold text-green-800 dark:text-green-300 mb-2'>
                  📧 Check Your Email!
                </h3>
                <p className='text-green-700 dark:text-green-400 mb-4'>
                  We've sent a verification link to <strong>{formData.email}</strong>. 
                  Please check your inbox and click the link to verify your account.
                </p>
                <div className='flex flex-col gap-2'>
                  <Button
                    color="success"
                    onClick={handleResendVerification}
                    disabled={loading}
                    size="sm"
                  >
                    {loading ? <Spinner size='sm' /> : 'Resend Verification Email'}
                  </Button>
                  <Button
                    color="gray"
                    onClick={() => navigate('/sign-in')}
                    size="sm"
                  >
                    Go to Sign In
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Sign Up Form Card - Hide when verification notice is shown */}
          {!showVerificationNotice && (
            <Card>
              <div className='text-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                  Create Account
                </h2>
                <p className='text-gray-600 dark:text-gray-400 mt-2'>
                  Sign up to get started
                </p>
              </div>

              <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                <div className='space-y-2'>
                  <Label htmlFor='username' value='Username' />
                  <TextInput
                    type='text'
                    placeholder='Enter your username'
                    id='username'
                    onChange={handleChange}
                    required
                    shadow
                  />
                </div>
                
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
                  <Label htmlFor='password' value='Password' />
                  <TextInput
                    type='password'
                    placeholder='At least 6 characters'
                    id='password'
                    onChange={handleChange}
                    required
                    shadow
                  />
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Password must be at least 6 characters long
                  </p>
                </div>

                <Button
                  color="purple"
                  type='submit'
                  disabled={loading}
                  className='w-full mt-4'
                  size='lg'
                >
                  {loading ? (
                    <>
                      <Spinner size='sm' />
                      <span className='pl-3'>Creating Account...</span>
                    </>
                  ) : (
                    'Sign Up'
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

              {/* Sign In Link */}
              <div className='text-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Already have an account?{' '}
                  <Link 
                    to='/sign-in' 
                    className='text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium'
                  >
                    Sign In
                  </Link>
                </span>
              </div>
            </Card>
          )}

          {/* Success Message */}
          {successMessage && !showVerificationNotice && (
            <Alert className='mt-4' color='success'>
              <span className='font-medium'>Success!</span> {successMessage}
            </Alert>
          )}

          {/* Error Message */}
          {errorMessage && (
            <Alert className='mt-4' color='failure'>
              <span className='font-medium'>Error!</span> {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}