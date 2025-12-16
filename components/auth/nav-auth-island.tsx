'use client';

import { useUser } from '@clerk/nextjs';
import AuthButton from './auth-button';
import { useUserInfo } from '@/lib/providers';
import { memo, useMemo } from 'react';

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

// 优惠券图标
const TicketIcon = ({ className }: { className: string }) => (
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
      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
    />
  </svg>
);

function NavAuthIsland({ variant = 'desktop' }: NavAuthIslandProps) {
  const { isSignedIn } = useUser();
  const { userInfo, isLoadingUserInfo } = useUserInfo();

  const coinIconClassName = variant === 'desktop' ? 'h-4 w-4' : 'h-3 w-3';

  // 显示逻辑：按照 pointsrules.md 的规则
  // 1. 未充值用户（level === 0）且有优惠券 → 显示优惠券
  // 2. 其他情况 → 显示积分图标 + 实际积分数值
  const displayInfo = useMemo(() => {
    if (!isSignedIn || isLoadingUserInfo || !userInfo) {
      return null;
    }

    // 计算总积分：优先使用 total_credits，如果没有则使用 free_limit + remaining_limit
    const totalCredits = userInfo.total_credits ?? 
      ((userInfo.free_limit ?? 0) + (userInfo.remaining_limit ?? 0));
    const freeTimes = userInfo.free_times ?? 0;
    const userLevel = userInfo.level ?? 0;
    const isPaidUser = userLevel > 0;
    const hasFreeVouchers = freeTimes > 0 && userLevel === 0;

    // 规则1: 未充值用户且有优惠券 → 显示优惠券（即使有赠送的积分也显示优惠券）
    if (hasFreeVouchers) {
      return {
        type: 'voucher' as const,
        value: freeTimes,
        icon: TicketIcon,
      };
    }
    
    // 其他情况 → 显示积分图标 + 实际积分数值
    return {
      type: 'credits' as const,
      value: totalCredits,
      icon: CoinsIcon,
    };
  }, [isSignedIn, isLoadingUserInfo, userInfo]);

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
      {isSignedIn && displayInfo && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <displayInfo.icon className={coinIconClassName} />
          <span>
            {isLoadingUserInfo 
              ? '...' 
              : displayInfo.type === 'voucher' 
                ? `${displayInfo.value} Free`
                : displayInfo.value.toString()}
          </span>
        </div>
      )}
      <AuthButton />
    </div>
  );
}

// 使用 React.memo 包裹，避免无谓重渲染
export default memo(NavAuthIsland);