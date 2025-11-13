'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export default function SSOCallbackPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      
      <div className="text-center space-y-6 px-4">
        {/* Loading spinner with better styling */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-gray-700 rounded-full"></div>
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>

        {/* Loading text with fade animation */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-white">Completing sign in...</h2>
          <p className="text-sm text-gray-400">Please wait while we redirect you</p>
        </div>

        <AuthenticateWithRedirectCallback signInForceRedirectUrl={redirectUrl} signUpForceRedirectUrl={redirectUrl} />
        {/* Required for sign-up flows - Clerk's bot sign-up protection is enabled by default */}
        <div id="clerk-captcha" />

      </div>
    </div>
  );
}

