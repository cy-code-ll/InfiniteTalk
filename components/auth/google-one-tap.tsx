'use client';

import { GoogleOneTap } from '@clerk/nextjs';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';

interface GoogleOneTapAuthProps {
  /** 如果为true，当用户点击提示框外部时会自动关闭One Tap提示框。默认: true */
  cancelOnTapOutside?: boolean;
  /** 如果为true，在ITP浏览器（如iOS上的Chrome、Safari和FireFox）上启用ITP特定的用户体验。默认: true */
  itpSupport?: boolean;
  /** 如果为true，启用Google One Tap使用FedCM API登录用户。默认: true */
  fedCmSupport?: boolean;
  /** 登录后的重定向URL，会覆盖ClerkProvider的设置 */
  signInForceRedirectUrl?: string;
  /** 注册后的重定向URL，会覆盖ClerkProvider的设置 */
  signUpForceRedirectUrl?: string;
}

export default function GoogleOneTapAuth({
  cancelOnTapOutside = true,
  itpSupport = true,
  fedCmSupport = true,
  signInForceRedirectUrl,
  signUpForceRedirectUrl,
}: GoogleOneTapAuthProps) {
  const { isSignedIn, user } = useUser();
  const pathname = usePathname();

  // 如果用户已登录，不显示Google One Tap
  if (isSignedIn) {
    return null;
  }

  console.log('GoogleOneTapAuth: 当前路径和重定向设置', {
    pathname,
    signInForceRedirectUrl,
    signUpForceRedirectUrl,
    windowLocation: typeof window !== 'undefined' ? window.location.href : 'SSR'
  });

  // 根据Clerk文档，如果不设置forceRedirectUrl，应该默认回到启动认证的页面
  // 让我们尝试只在明确指定时才传递重定向URL，否则让Clerk使用默认行为
  const googleOneTapProps: any = {
    cancelOnTapOutside,
    itpSupport, 
    fedCmSupport,
  };

  // 只有在明确传入重定向URL时才设置，否则让Clerk使用默认行为
  if (signInForceRedirectUrl) {
    googleOneTapProps.signInForceRedirectUrl = signInForceRedirectUrl;
  }
  if (signUpForceRedirectUrl) {
    googleOneTapProps.signUpForceRedirectUrl = signUpForceRedirectUrl;
  }

  return <GoogleOneTap {...googleOneTapProps} />;
} 