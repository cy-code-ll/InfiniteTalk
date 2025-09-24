'use client';

import { useUser } from '@clerk/nextjs';
import { Coins } from 'lucide-react';
import AuthButton from './auth-button';
import { useUserInfo } from '@/lib/providers';

type NavAuthIslandProps = {
  variant?: 'desktop' | 'mobile';
};

export default function NavAuthIsland({ variant = 'desktop' }: NavAuthIslandProps) {
  const { isSignedIn } = useUser();
  const { userInfo, isLoadingUserInfo } = useUserInfo();

  const coinIconClassName = variant === 'desktop' ? 'h-4 w-4' : 'h-3 w-3';

  return (
    <div className={variant === 'desktop' ? 'flex items-center gap-4' : 'flex items-center gap-2'}>
      {isSignedIn && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Coins className={coinIconClassName} />
          <span>{isLoadingUserInfo ? '...' : userInfo?.total_credits || '0'}</span>
        </div>
      )}
      <AuthButton />
    </div>
  );
}


