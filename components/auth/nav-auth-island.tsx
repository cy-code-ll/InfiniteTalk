'use client';

import { useUser } from '@clerk/nextjs';
import AuthButton from './auth-button';
import { useUserInfo } from '@/lib/providers';
import { memo } from 'react';

type NavAuthIslandProps = {
  variant?: 'desktop' | 'mobile';
};

// 内联 SVG 图标，避免 lucide-react 运行时
const CoinsIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function NavAuthIsland({ variant = 'desktop' }: NavAuthIslandProps) {
  const { isSignedIn } = useUser();
  const { userInfo, isLoadingUserInfo } = useUserInfo();

  const coinIconClassName = variant === 'desktop' ? 'h-4 w-4' : 'h-3 w-3';

  // 指针靠前预热（头像区域）
  const prewarm = () => {
    try {
      // 触发菜单模块的解析与缓存
      import('./user-profile-menu');
    } catch {}
  };

  return (
    <div 
      className={variant === 'desktop' ? 'flex items-center gap-4' : 'flex items-center gap-2'}
      onPointerEnter={prewarm}
      onPointerDown={prewarm}
    >
      {isSignedIn && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CoinsIcon className={coinIconClassName} />
          <span>{isLoadingUserInfo ? '...' : userInfo?.total_credits || '0'}</span>
        </div>
      )}
      <AuthButton />
    </div>
  );
}

// 使用 React.memo 包裹，避免无谓重渲染
export default memo(NavAuthIsland);