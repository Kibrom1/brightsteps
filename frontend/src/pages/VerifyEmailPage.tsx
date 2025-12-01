import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApiClient } from '../lib/api-client';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    const verify = async () => {
      try {
        const client = getApiClient();
        // Using raw fetch since our client wrapper might be typed for specific responses
        // and we just added this endpoint
        // Actually, let's try to use the client if possible, or just fetch
        const response = await fetch(`/api/v1/auth/verify-email?token=${token}`, {
            method: 'POST',
        });
        
        if (response.ok) {
            setStatus('success');
        } else {
            const data = await response.json();
            setStatus('error');
            setMessage(data.detail || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification.');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
        </div>
        
        <div className="text-center">
          {status === 'verifying' && (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 mb-4">Email verified successfully!</p>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Proceed to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-red-600 mb-4">{message}</p>
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

