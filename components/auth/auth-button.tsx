'use client';

import { useUser } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import { useEffect, useState } from 'react';
import { CustomSignModal } from './custom-sign-modal';

// 模块级预热状态
let prewarmed = false;
let CachedUserMenu: any = null;

// 预热函数
const prewarmModules = () => {
  if (prewarmed) return;
  
  const prewarm = () => {
    import('./user-profile-menu').then(m => (CachedUserMenu = m.default))
      .then(() => {
        prewarmed = true;
      })
      .catch(() => {
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
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // 加载状态 - 优雅的骨架屏
  if (!isLoaded) {
    return (
      <div className="w-24 h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-full animate-pulse">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-shimmer" />
      </div>
    );
  }

  if (isSignedIn && user) {
    const UserMenu = CachedUserMenu || require('./user-profile-menu').default;
    return <UserMenu user={user} />;
  }

  const handleLoginClick = () => {
    // 使用 requestAnimationFrame 确保视觉反馈先绘制
    requestAnimationFrame(() => {
      setIsModalOpen(true);
    });
  };

  return (
    <>
      <Button
        variant="default"
        className="bg-primary text-black hover:bg-primary/90 px-6 py-2 rounded-full transition-colors"
        onClick={handleLoginClick}
      >
        Login
      </Button>
      <CustomSignModal open={isModalOpen} onOpenChange={setIsModalOpen} initialView="signin" />
    </>
  );
}