'use client';

import { SignIn } from '@clerk/nextjs';
import { GoogleOneTapAuth } from '@/components/auth';
export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FFF8F0]">
      {/* Google One Tap - 在登录页面显示 */}
      <GoogleOneTapAuth
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/"
      />
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: 'bg-[#FFB347] hover:bg-[#F67280]',
            card: 'bg-white shadow-md'
          }
        }}
      />
    </div>
  );
} 