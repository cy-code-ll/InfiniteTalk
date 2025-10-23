'use client';

import React, { useState, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { LiteDrawer, LiteDrawerClose } from './LiteDrawer';
import { cn } from '../../lib/utils';

// Lazy load auth island
const NavAuthIsland = dynamic(() => import('../auth/nav-auth-island'), {
  ssr: false,
  loading: () => <div className="w-24 h-10 bg-gray-200 rounded-full" />, // 移除 animate-pulse
});

// Lazy load mobile auth island with intersection observer
const AuthIslandVisible = dynamic(() => import('./AuthIslandVisible'), {
  ssr: false,
  loading: () => <div className="w-24 h-10 bg-gray-200 rounded-full" />, // 静态占位
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

// Mobile Links - Memoized
const MobileLinks = memo(({ pathname, onClose }: { pathname: string; onClose: () => void }) => {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/infinitetalk', label: 'Infinitetalk' },
    { href: '/infinitetalk-multi', label: 'InfiniteTalk Multi' },
    { href: '/wan2.2-s2v', label: 'WAN2.2 S2V' },
    { href: '/infinitetalk-comfyui', label: 'ComfyUI Guide' },
    { href: '/pricing', label: 'Price' },
    { href: '/free/referral', label: 'Referral' },
    { href: '/app', label: 'App' },
  ];

  return (
    <>
      {links.map((link) => (
        <LiteDrawerClose key={link.href} onClose={onClose}>
          <Link
            href={link.href}
            prefetch={false}
            className={cn(
              'block px-4 py-2 rounded-md transition-colors',
              pathname === link.href
                ? 'text-primary font-medium bg-primary/20'
                : 'text-white/90 hover:text-primary hover:bg-slate-800'
            )}
          >
            {link.label}
          </Link>
        </LiteDrawerClose>
      ))}
    </>
  );
});
MobileLinks.displayName = 'MobileLinks';

export function NavClient() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            Price
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
        {/* Desktop: Auth island */}
        <div className="hidden lg:flex items-center gap-4">
          <NavAuthIsland variant="desktop" />
        </div>

        {/* Mobile: Auth island + Menu */}
        <div className="flex lg:hidden items-center gap-2">
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
              {/* Header */}
              <div className="sticky top-0 z-10 -mx-6 px-6 pt-4 pb-4 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/80 flex items-center justify-between border-b border-white/10">
                <h2 className="text-lg font-semibold">Menu</h2>
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
                <MobileLinks pathname={pathname} onClose={handleCloseMenu} />
              </nav>
            </div>
          </LiteDrawer>
        </div>
      </div>
    </>
  );
}

