'use client';

import { useEffect, useState, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useUserInfo } from '@/lib/providers';

// 内联 SVG 图标
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

// 静态占位骨架
const AuthSkeleton = () => (
  <div className="flex items-center gap-2">
    {/* <div className="w-6 h-6 bg-gray-200 rounded-full" />
    <div className="w-16 h-4 bg-gray-200 rounded" /> */}
  </div>
);

export default function AuthIslandVisible() {
  const [isVisible, setIsVisible] = useState(false);
  const [AuthButton, setAuthButton] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isSignedIn } = useUser();
  const { userInfo, isLoadingUserInfo } = useUserInfo();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          // 动态导入 AuthButton
          import('../auth/auth-button').then((module) => {
            setAuthButton(() => module.default);
          });
        }
      },
      {
        rootMargin: '200px', // 提前 200px 开始加载
        threshold: 0.1,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVisible]);

  return (
    <div ref={containerRef} className="flex items-center gap-2">
      {isSignedIn && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <CoinsIcon className="h-3 w-3" />
          <span>{isLoadingUserInfo ? '...' : userInfo?.total_credits || '0'}</span>
        </div>
      )}
      {isVisible && AuthButton ? (
        <AuthButton />
      ) : (
        <AuthSkeleton />
      )}
    </div>
  );
}
