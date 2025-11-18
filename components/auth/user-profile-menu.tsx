'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useClerk } from "@clerk/nextjs";
import { UserResource } from "@clerk/types";
import Link from "next/link";
import { useCallback, useState } from "react";
import FastMenu from "@/components/profile/FastMenu";
import { useUserInfo } from '@/lib/providers';
import { api } from '@/lib/api';

interface UserProfileMenuProps {
  user: UserResource;
}

export default function UserProfileMenu({ user }: UserProfileMenuProps) {
  const { signOut } = useClerk();
  const { clearUserState } = useUserInfo();
  const [pathname, setPathname] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;

  const readPathnameOnce = useCallback(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  const handleSignOut = (close: () => void) => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    // 先关闭菜单，保证视觉反馈先绘制
    close();
    // 两帧后再做清理与跳转，避免阻塞点击帧
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // 轻量任务放到微任务，尽快生效但不阻塞绘制
        queueMicrotask(() => {
          try { api.auth.clearTokens(); } catch {}
          try { clearUserState(); } catch {}
        });
        // 跳转/signOut 放到下一轮任务队列，防止卡顿
        setTimeout(() => {
          try { signOut(); } finally { setIsSigningOut(false); }
        }, 0);
      });
    });
  };


  // 预热函数：供触发器 pointer 事件使用
  // 从 auth-button 的模块级缓存中读取并触发（允许重复调用）
  const prewarm = () => {
    try {
      // 动态导入即可触发模块缓存
      import('./user-profile-menu');
    } catch {}
  };

  return (
    <>
      <FastMenu
        align="end"
        trigger={() => (
          <Button 
            variant="ghost" 
            className="relative h-8 w-8 rounded-full"
            onPointerEnter={prewarm}
            onPointerDown={prewarm}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={user.imageUrl} 
                alt={user.username || ''} 
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
              />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        )}
      >
        {(close) => (
          <div className="p-1" onLoad={readPathnameOnce}>
            <div className="px-3 py-2">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.fullName || user.username}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <div className="h-px bg-border my-1" />
            <button
              className={`flex w-full items-center px-2 py-2 text-sm rounded-md hover:bg-muted ${
                pathname === `/profile` ? 'bg-muted font-semibold' : ''
              }`}
              onClick={close}
            >
              <Link href={`/profile`} prefetch={false} className="w-full text-left">
                Profile
              </Link>
            </button>
            <div className="h-px bg-border my-1" />
            <button
              className="flex w-full items-center px-2 py-2 text-sm rounded-md hover:bg-muted"
              disabled={isSigningOut}
              onClick={() => handleSignOut(close)}
            >
              Sign Out
            </button>
          </div>
        )}
      </FastMenu>
    </>
  );
}