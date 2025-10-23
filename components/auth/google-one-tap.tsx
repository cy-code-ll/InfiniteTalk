'use client';

import { useUser } from '@clerk/nextjs';
import { lazy, Suspense, useEffect, useState } from 'react';

// 懒加载 GoogleOneTap 组件
const GoogleOneTap = lazy(() => import('@clerk/nextjs').then(mod => ({ default: mod.GoogleOneTap })));

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
  // 所有 Hooks 必须在条件渲染之前调用
  const { isSignedIn } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [show, setShow] = useState(false);

  // 防止 Hydration 不匹配：只在客户端挂载后渲染
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 空闲时加载 GoogleOneTap
  useEffect(() => {
    if (!isSignedIn && isMounted) {
      const loadGoogleOneTap = () => {
        setShow(true);
      };

      // 使用 requestIdleCallback，无则 setTimeout 兜底
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(loadGoogleOneTap, { timeout: 1500 });
      } else {
        setTimeout(loadGoogleOneTap, 1500);
      }
    }
  }, [isSignedIn, isMounted]);

  // 条件渲染逻辑放在所有 Hooks 之后
  // 如果用户已登录，不显示Google One Tap
  if (isSignedIn) {
    return null;
  }

  // 防止 Hydration 不匹配：服务端渲染时返回 null
  if (!isMounted) {
    return null;
  }

  // 只有在 show 为 true 时才渲染
  if (!show) {
    return null;
  }

  // 根据Clerk文档，如果不设置forceRedirectUrl，应该默认回到启动认证的页面
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

  return (
    <Suspense fallback={null}>
      <GoogleOneTap {...googleOneTapProps} />
    </Suspense>
  );
}