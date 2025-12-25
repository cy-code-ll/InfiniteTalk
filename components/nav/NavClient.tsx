'use client';

import React, { useState, useCallback, memo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LiteDrawer, LiteDrawerClose } from './LiteDrawer';
import SmartLink from './SmartLink';
import { cn } from '../../lib/utils';

// Hook to detect if screen is desktop (lg breakpoint)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024); // lg breakpoint is 1024px
    };

    // Set initial value
    checkIsDesktop();

    // Listen for resize events
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  return isDesktop;
}

// Loading spinner component
const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Lazy load auth island
const NavAuthIsland = dynamic(() => import('./nav-auth-island'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
      <LoadingSpinner />
      <span className="text-sm text-gray-500 dark:text-gray-400">Signing in</span>
    </div>
  ),
});

// Lazy load mobile auth island with intersection observer
const AuthIslandVisible = dynamic(() => import('./AuthIslandVisible'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
      <LoadingSpinner />
      <span className="text-sm text-gray-500 dark:text-gray-400">Signing in</span>
    </div>
  ),
});

// Inline Menu SVG Icon - no lucide dependency
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

// Mobile Links - Optimized for INP
const MobileLinks = memo(({ pathname }: { pathname: string }) => {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/infinitetalk', label: 'Infinitetalk' },
    { href: '/infinitetalk-multi', label: 'InfiniteTalk Multi' },
    { href: '/wan2.2-s2v', label: 'WAN2.2 S2V' },
    { href: '/infinitetalk-comfyui', label: 'ComfyUI Guide' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/free/referral', label: 'Referral' },
    { href: '/app', label: 'App' },
  ];

  return (
    <>
      {links.map((link) => (
        <SmartLink
          key={link.href}
          href={link.href}
          className={cn(
            'block px-4 py-2 rounded-md transition-colors',
            pathname === link.href
              ? 'text-primary font-medium bg-primary/20'
              : 'text-white/90 hover:text-primary hover:bg-slate-800'
          )}
          onClosed={() => {
            // 第3帧清除焦点/滚动锁之类
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          {link.label}
        </SmartLink>
      ))}
    </>
  );
});
MobileLinks.displayName = 'MobileLinks';

export function NavClient() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isDesktop = useIsDesktop();

  // 监听 SmartLink 的关闭事件
  useEffect(() => {
    const close = () => setIsMobileMenuOpen(false);
    window.addEventListener('drawer-close', close as any, { once: true });
    return () => window.removeEventListener('drawer-close', close as any);
  }, [isMobileMenuOpen]); // 当抽屉打开时，监听一次

  // Use RAF for opening to defer heavy work
  const handleOpenMenu = useCallback(() => {
    requestAnimationFrame(() => {
      setIsMobileMenuOpen(true);
    });
  }, []);

  const handleCloseMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      {/* Desktop Nav Links */}
      <div className="hidden lg:flex items-center justify-center flex-1">
        <div className="flex items-center space-x-1">
          <Link
            href="/"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            Home
          </Link>
          <Link
            href="/infinitetalk"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/infinitetalk' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            Infinitetalk
          </Link>
          <Link
            href="/infinitetalk-multi"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/infinitetalk-multi' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            InfiniteTalk Multi
          </Link>
          <Link
            href="/wan2.2-s2v"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/wan2.2-s2v' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            WAN2.2 S2V
          </Link>
          <Link
            href="/infinitetalk-comfyui"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/infinitetalk-comfyui' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            ComfyUI Guide
          </Link>
          <Link
            href="/pricing"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/pricing' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            Pricing
          </Link>
          <Link
            href="/free/referral"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/free/referral' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            Referral
          </Link>
          <Link
            href="/app"
            className={cn(
              'nav-link-item px-4 py-2 rounded-md transition-colors',
              pathname === '/app' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
            )}
          >
            App
          </Link>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-[180px] 2xl:w-[200px] flex items-center justify-end gap-2">
        {/* Desktop: Auth island - conditionally rendered */}
        {isDesktop && (
          <div className="flex items-center gap-4">
            <NavAuthIsland variant="desktop" />
          </div>
        )}

        {/* Mobile: Auth island + Menu - conditionally rendered */}
        {!isDesktop && (
          <div className="flex items-center gap-2">
            <AuthIslandVisible />
            
            {/* Menu Button */}
            <button
              onClick={handleOpenMenu}
              className="inline-flex items-center justify-center h-10 w-10 rounded-md text-white hover:text-primary hover:bg-slate-700/50 transition-colors"
              aria-label="Open menu"
              type="button"
            >
              <MenuIcon />
            </button>

            {/* Lightweight Drawer */}
            <LiteDrawer
              open={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
              className="w-[300px] sm:w-[340px]"
            >
              <div className="flex flex-col h-full px-6 pt-[env(safe-area-inset-top,0)] pb-[env(safe-area-inset-bottom,0)] text-white">
                {/* Header - 移除 backdrop-blur 优化性能 */}
                <div className="sticky top-0 z-10 -mx-6 px-6 pt-4 pb-4 bg-slate-900/95 flex items-center justify-between border-b border-white/10">
                  <div className="text-lg font-semibold">Menu</div>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => requestAnimationFrame(() => setIsMobileMenuOpen(false))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90 hover:text-primary hover:bg-slate-800 transition-colors"
                  >
                    {/* Close (X) icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Links */}
                <nav className="flex flex-col space-y-4 mt-6 pb-10">
                  <MobileLinks pathname={pathname} />
                </nav>
              </div>
            </LiteDrawer>
          </div>
        )}
      </div>
    </>
  );
}

