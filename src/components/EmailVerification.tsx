'use client';

import { useState, useEffect } from 'react';
import { sendEmailVerification, reload } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function EmailVerification() {
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user) {
      setIsVerified(user.emailVerified);
      setChecking(false);
    }
  }, [user]);

  const handleSendVerification = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification Email Sent', 'Please check your email and click the verification link.');
    } catch (error: any) {
      console.error('Error sending verification email:', error);
      let errorMessage = 'Failed to send verification email. Please try again.';
      
      switch (error.code) {
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      toast.error('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;

    setChecking(true);
    try {
      await reload(user);
      setIsVerified(user.emailVerified);
      if (user.emailVerified) {
        toast.success('Email Verified', 'Your email has been successfully verified!');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      toast.error('Refresh Failed', 'Failed to refresh verification status.');
    } finally {
      setChecking(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking verification status..." />
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email Verified
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your email address has been successfully verified. You now have full access to all features.
          </p>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-center mb-4">
          <div className="bg-yellow-100 p-3 rounded-full">
            <Mail className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Verify Your Email
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          We've sent a verification email to <strong>{user?.email}</strong>. 
          Please check your inbox and click the verification link to activate your account.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Important:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>Check your spam folder if you don't see the email</li>
                <li>The verification link expires in 24 hours</li>
                <li>You may need to refresh this page after verification</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSendVerification}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                <span>Resend Verification Email</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={checking}
            className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {checking ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>I've Verified My Email</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Contact support for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
