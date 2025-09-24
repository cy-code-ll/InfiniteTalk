'use client';

import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '../../components/ui/button';
import { Suspense, lazy } from 'react';

// 懒加载用户菜单组件
const UserProfileMenu = lazy(() => import('./user-profile-menu'));

export default function AuthButton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  // 加载状态
  if (!isLoaded) {
    return (
      <div className="w-24 h-10 bg-gray-200 rounded-full animate-pulse" />
    );
  }

  if (isSignedIn && user) {
    return (
      <Suspense fallback={<div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />}>
        <UserProfileMenu user={user} />
      </Suspense>
    );
  }

  return (
    <Button
      variant="default"
      className="bg-primary text-black hover:bg-primary/90 px-6 py-2 rounded-full transition-colors"
      onClick={() => openSignIn()}
    >
      Login
    </Button>
  );
} 