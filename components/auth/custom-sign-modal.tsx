'use client';

import { useState, useEffect, useCallback, memo, useMemo, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useSignIn, useSignUp } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

type View = 'signin' | 'signup' | 'verify-email';

interface CustomSignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialView?: View;
  // When true, keep the modal mounted even when not open (render hidden)
  forceMount?: boolean;
}

// Memoize the component to prevent unnecessary re-renders
export const CustomSignModal = memo(function CustomSignModal({ open, onOpenChange, initialView = 'signin', forceMount = false }: CustomSignModalProps) {
  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setActiveSignUp, isLoaded: signUpLoaded } = useSignUp();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Pre-compute paths to avoid calculation during click
  const currentPath = useMemo(() => {
    return pathname || (typeof window !== 'undefined' ? window.location.pathname : '/') || '/';
  }, [pathname]);

  const redirectUrlWithPath = useMemo(() => {
    return `/sso-callback?redirect_url=${encodeURIComponent(currentPath)}`;
  }, [currentPath]);

  // Ensure component is mounted (for SSR compatibility)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setView(initialView);
      setEmail('');
      setPassword('');
      setVerificationCode('');
      setError(null);
      setPasswordError(null);
      setPasswordTouched(false);
      setIsOAuthLoading(false);
      setIsLoading(false);
    }
  }, [open, initialView]);


  // Resend countdown
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Escape key to close (lightweight, no modal)
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // 允许在 loading 状态下关闭，但需要清理 loading 状态
        setIsLoading(false);
        setIsOAuthLoading(false);
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  const handleGoogleSignIn = useCallback(async () => {
    if (isOAuthLoading || isLoading) return;
    
    // Clear error immediately for instant feedback
    setError(null);
    
    // Delay loading state update to improve INP (50ms delay)
    const loadingTimeout = setTimeout(() => {
      setIsOAuthLoading(true);
    }, 50);
    
    try {
      if (view === 'signin' && signInLoaded && signIn) {
        // Use Clerk's OAuth flow for sign in
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: redirectUrlWithPath,
          redirectUrlComplete: currentPath,
        });
      } else if (view === 'signup' && signUpLoaded && signUp) {
        // Use Clerk's OAuth flow for sign up
        await signUp.authenticateWithRedirect({
          strategy: 'oauth_google',
          redirectUrl: redirectUrlWithPath,
          redirectUrlComplete: currentPath,
        });
      }
    } catch (err: any) {
      clearTimeout(loadingTimeout);
      setError(err.errors?.[0]?.message || 'Failed to sign in with Google');
      setIsOAuthLoading(false);
    }
  }, [view, signInLoaded, signIn, signUpLoaded, signUp, isOAuthLoading, isLoading, redirectUrlWithPath, currentPath]);

  const handleSignIn = useCallback(async () => {
    if (!signInLoaded || !signIn || isLoading || isOAuthLoading) return;
    
    // Clear error immediately for instant feedback
    setError(null);
    
    // Delay loading state update to improve INP (50ms delay)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(true);
    }, 50);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === 'complete') {
        await setActiveSignIn({ session: result.createdSessionId });
        onOpenChange(false);
        router.refresh();
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error('Sign-in attempt not complete:', result);
        console.error('Sign-in attempt status:', result.status);
        setError('Sign in incomplete. Please try again.');
      }
    } catch (err: any) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error('Sign-in error:', JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    }
  }, [signInLoaded, signIn, email, password, isLoading, isOAuthLoading, setActiveSignIn, onOpenChange, router]);

  const handleSignUp = useCallback(async () => {
    if (!signUpLoaded || !signUp || isLoading || isOAuthLoading) return;
    
    // Clear error immediately for instant feedback
    setError(null);
    
    // Delay loading state update to improve INP (50ms delay)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(true);
    }, 50);

    try {
      // Step 1: Start the sign-up process using the email and password provided
      await signUp.create({
        emailAddress: email,
        password,
      });

      // Step 2: Send the user an email with the verification code
      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      // Step 3: Switch to verification view to capture the OTP code
      setView('verify-email');
    } catch (err: any) {
      // See https://clerk.com/docs/guides/development/custom-flows/error-handling
      // for more info on error handling
      console.error('Sign-up error:', JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    }
  }, [signUpLoaded, signUp, email, password, isLoading, isOAuthLoading, setView]);

  const handleVerifyEmail = useCallback(async () => {
    if (!signUpLoaded || !signUp || isLoading || isOAuthLoading) return;
    
    // Clear error immediately for instant feedback
    setError(null);
    
    // Delay loading state update to improve INP (50ms delay)
    const loadingTimeout = setTimeout(() => {
      setIsLoading(true);
    }, 50);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActiveSignUp({ session: result.createdSessionId });
        onOpenChange(false);
        router.refresh();
      } else if (result.status === 'missing_requirements') {
        // Handle missing requirements after email verification
        console.error('Missing requirements:', result.missingFields);
        setError('Please complete all required fields.');
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error('Verification attempt not complete:', result);
        console.error('Verification attempt status:', result.status);
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code');
      // Clear code on error
      setVerificationCode('');
    } finally {
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    }
  }, [signUpLoaded, signUp, verificationCode, isLoading, isOAuthLoading, setActiveSignUp, onOpenChange, router]);

  const handleResendCode = useCallback(async () => {
    if (!signUpLoaded || !signUp || resendCountdown > 0 || isLoading || isOAuthLoading) return;

    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setResendCountdown(30);
      setError(null);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to resend code');
    }
  }, [signUpLoaded, signUp, resendCountdown, isLoading, isOAuthLoading]);

  // Check if error is password-related
  const isPasswordRelatedError = useCallback((errorMsg: string | null): boolean => {
    if (!errorMsg) return false;
    const lowerError = errorMsg.toLowerCase();
    return (
      lowerError.includes('password') ||
      lowerError.includes('data breach') ||
      lowerError.includes('breach')
    );
  }, []);

  // Update password error when error changes
  useEffect(() => {
    if (error && isPasswordRelatedError(error)) {
      setPasswordError(error);
    } else {
      setPasswordError(null);
    }
  }, [error, isPasswordRelatedError]);

  // Memoize title and description to prevent unnecessary re-renders
  const title = useMemo(() => {
    if (view === 'signin') return 'Sign in to InfiniteTalk';
    if (view === 'signup') return 'Create your account';
    return 'Verify your email';
  }, [view]);

  const description = useMemo(() => {
    if (view === 'signin') return 'Welcome back! Please sign in to continue';
    if (view === 'signup') return 'Welcome! Please fill in the details to get started.';
    return null;
  }, [view]);

  // Only render content when open OR forceMount (preload), and client ready
  if ((!open && !forceMount) || !mounted || typeof document === 'undefined') return null;

  // Show all at once: when not open (but force mounted), keep fully hidden without fade
  const backdropClass = open
    ? "fixed inset-0 z-50 pointer-events-auto bg-black/20"
    : "fixed inset-0 z-50 pointer-events-none bg-transparent hidden";

  const modalContent = (
    <div 
      className={backdropClass} 
      aria-hidden={!open}
      onClick={(e) => {
        // Close modal when clicking on backdrop
        // 允许在 loading 状态下关闭，但需要清理 loading 状态
        if (e.target === e.currentTarget) {
          setIsLoading(false);
          setIsOAuthLoading(false);
          onOpenChange(false);
        }
      }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[calc(100%-2rem)] sm:max-w-[440px] p-4">
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          className={`relative rounded-lg border bg-white shadow-lg ${open ? 'pointer-events-auto' : 'pointer-events-none'} max-h-[90vh] overflow-auto`}
        >
        <button
          type="button"
          aria-label="Close"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // 允许在 loading 状态下关闭，但需要清理 loading 状态
            setIsLoading(false);
            setIsOAuthLoading(false);
            onOpenChange(false);
          }}
          className="absolute top-3 right-3 z-10 rounded-xs text-gray-600 hover:text-gray-900 transition-colors focus:outline-hidden"
        >
          <X className="w-4 h-4" />
          <span className="sr-only">Close</span>
        </button>
        <div className="p-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-1.5">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-gray-700 font-normal">
                {description}
              </p>
            )}
          </div>

          {view === 'signin' && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-3 h-10 border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] active:bg-gray-100 transition-transform duration-75 relative text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={handleGoogleSignIn}
                disabled={isOAuthLoading || isLoading}
              >
                {isOAuthLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {isOAuthLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="signin-email" className="text-xs font-medium text-gray-900 mb-1 block">
                    Email address
                  </Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 bg-gray-50 border-gray-300 focus:bg-white text-gray-900 placeholder:text-gray-400 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="signin-password" className="text-xs font-medium text-gray-900 mb-1 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-9 bg-gray-50 border-gray-300 focus:bg-white pr-10 text-gray-900 placeholder:text-gray-400 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSignIn();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Show all errors below password field for signin */}
                {error && (
                  <div className="mt-1.5 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
                    {error}
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isLoading || isOAuthLoading || !email || !password}
                  className="w-full h-9 bg-black text-white hover:bg-gray-800 active:scale-[0.98] active:bg-gray-900 transition-transform duration-75 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Continue
                      <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-700">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    startTransition(() => {
                      setView('signup');
                      setError(null);
                    });
                  }}
                  className="text-gray-900 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isOAuthLoading}
                >
                  Sign up
                </button>
              </p>
            </>
          )}

          {view === 'signup' && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full mb-3 h-10 border-gray-300 bg-white hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98] active:bg-gray-100 transition-transform duration-75 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                onClick={handleGoogleSignIn}
                disabled={isOAuthLoading || isLoading}
              >
                {isOAuthLoading ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                {isOAuthLoading ? 'Connecting...' : 'Continue with Google'}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="signup-email" className="text-xs font-medium text-gray-900 mb-1 block">
                    Email address
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 bg-gray-50 border-gray-300 focus:bg-white text-gray-900 placeholder:text-gray-400 text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="signup-password" className="text-xs font-medium text-gray-900 mb-1 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!passwordTouched) {
                          setPasswordTouched(true);
                        }
                      }}
                      onBlur={() => setPasswordTouched(true)}
                      className="h-9 bg-gray-50 border-gray-300 focus:bg-white pr-10 text-gray-900 placeholder:text-gray-400 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-1.5">
                    {/* Show password-related errors if any, otherwise show hint */}
                    {passwordError ? (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
                        {passwordError}
                      </div>
                    ) : error && isPasswordRelatedError(error) ? (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
                        {error}
                      </div>
                    ) : error ? (
                      <div className="p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600">
                        {error}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        8 characters, including numbers and letters
                      </p>
                    )}
                  </div>
                </div>

                {/* Required for sign-up flows - Clerk's bot sign-up protection is enabled by default */}
                <div id="clerk-captcha" />

                <Button
                  type="button"
                  onClick={handleSignUp}
                  disabled={isLoading || isOAuthLoading || !email || !password}
                  className="w-full h-9 bg-gray-800 text-white hover:bg-gray-900 active:scale-[0.98] active:bg-gray-950 transition-transform duration-75 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-700">
                Already have an account?{' '}
                <button
                  onClick={() => {
                    startTransition(() => {
                      setView('signin');
                      setError(null);
                    });
                  }}
                  className="text-gray-900 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading || isOAuthLoading}
                >
                  Sign in
                </button>
              </p>
            </>
          )}

          {view === 'verify-email' && (
            <>
              <p className="text-xs text-gray-700 mb-4 text-center">
                Enter the verification code sent to your email
              </p>

              <div className="mb-3">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md border border-gray-200">
                  <span className="text-xs text-gray-900">{email}</span>
                  <button
                    onClick={() => {
                      startTransition(() => {
                        setView('signup');
                        setError(null);
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || isOAuthLoading}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="verification-code" className="text-xs font-medium text-gray-900 mb-1 block">
                  Verification code
                </Label>
                <Input
                  id="verification-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                    setVerificationCode(value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && verificationCode.length === 6) {
                      handleVerifyEmail();
                    }
                  }}
                  className="h-9 bg-gray-50 border-gray-300 focus:bg-white text-gray-900 placeholder:text-gray-400 text-center text-base font-semibold tracking-widest"
                  disabled={isLoading || isOAuthLoading}
                />
              </div>

              <div className="text-center mb-4">
                <button
                  onClick={handleResendCode}
                  disabled={resendCountdown > 0 || isLoading || isOAuthLoading}
                  className="text-xs text-gray-700 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Didn't receive a code? Resend {resendCountdown > 0 && `(${resendCountdown})`}
                </button>
              </div>

              <Button
                type="button"
                onClick={handleVerifyEmail}
                disabled={isLoading || isOAuthLoading || verificationCode.length !== 6}
                className="w-full h-9 bg-black text-white hover:bg-gray-800 active:scale-[0.98] active:bg-gray-900 transition-transform duration-75 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Continue
                    <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </Button>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Secured by{' '}
              <span className="inline-flex items-center">
                <span className="text-gray-400 font-semibold">clerk</span>
              </span>
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.open === nextProps.open &&
    prevProps.initialView === nextProps.initialView
  );
});
