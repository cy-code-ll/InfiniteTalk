'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import { useEffect, useState } from 'react';

// 模块级预热状态
let prewarmed = false;
let prewarmedModules: any = null;
let CachedUserMenu: any = null;

// 预热函数
const prewarmModules = () => {
  if (prewarmed) return;
  
  const prewarm = () => {
    Promise.all([
      import('@clerk/nextjs').then(m => m.SignIn),
      import('./user-profile-menu').then(m => (CachedUserMenu = m.default))
    ]).then(([SignIn]) => {
      prewarmedModules = { SignIn };
      prewarmed = true;
    }).catch(() => {
      // 预热失败，不影响功能
    });
  };

  // 使用 requestIdleCallback，无则 setTimeout 兜底
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(prewarm, { timeout: 1200 });
  } else {
    setTimeout(prewarm, 1200);
  }
};

export default function AuthButton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const [isPrewarmed, setIsPrewarmed] = useState(prewarmed);

  // 预热模块
  useEffect(() => {
    prewarmModules();
    
    // 监听预热完成
    const checkPrewarmed = () => {
      if (prewarmed) {
        setIsPrewarmed(true);
      } else {
        setTimeout(checkPrewarmed, 100);
      }
    };
    checkPrewarmed();
  }, []);

  // 层2：登录成功后立即预热
  useEffect(() => {
    if (isSignedIn && !CachedUserMenu) {
      import('./user-profile-menu').then(m => (CachedUserMenu = m.default));
      prewarmed = true;
      setIsPrewarmed(true);
    }
  }, [isSignedIn]);

  // 加载状态 - 静态占位骨架（无动画）
  if (!isLoaded) {
    return (
      <div className="w-24 h-10 bg-gray-200 rounded-full" />
    );
  }

  if (isSignedIn && user) {
    const UserMenu = CachedUserMenu || require('./user-profile-menu').default;
    return <UserMenu user={user} />;
  }

  const handleLoginClick = () => {
    // 使用 requestAnimationFrame 确保视觉反馈先绘制
    requestAnimationFrame(() => {
      openSignIn();
    });
  };

  return (
    <Button
      variant="default"
      className="bg-primary text-black hover:bg-primary/90 px-6 py-2 rounded-full transition-colors"
      onClick={handleLoginClick}
    >
      Login
    </Button>
  );
}