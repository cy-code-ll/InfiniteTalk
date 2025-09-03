'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import AuthButton from './auth/auth-button';
import { Menu, Coins } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "../components/ui/sheet";
import { useUser } from '@clerk/nextjs';
import { cn } from '../lib/utils';
import { useUserInfo } from '../lib/providers';

export function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { userInfo, isLoadingUserInfo } = useUserInfo();
  const handleMobileLinkClick = (action: () => void) => {
    action();
    setIsMobileMenuOpen(false);
  };

  const renderNavLinks = (isMobile = false) => {
    if (isMobile) {
      return (
        <>
          <SheetClose asChild>
            <Link
              href="/"
              className={cn(
                'nav-link-item px-4 py-2 rounded-md transition-colors',
                pathname === '/' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
              )}
            >
              Home
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/infinitetalk"
              className={cn(
                'nav-link-item px-4 py-2 rounded-md transition-colors',
                pathname === '/infinitetalk' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
              )}
            >
              Infinitetalk
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/wan2.2-s2v"
              className={cn(
                'nav-link-item px-4 py-2 rounded-md transition-colors',
                pathname === '/wan2.2-s2v' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
              )}
            >
              WAN2.2 S2V
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/infinitetalk-comfyui"
              className={cn(
                'nav-link-item px-4 py-2 rounded-md transition-colors',
                pathname === '/infinitetalk-comfyui' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
              )}
            >
              ComfyUI Guide
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/pricing"
              className={cn(
                'nav-link-item px-4 py-2 rounded-md transition-colors',
                pathname === '/pricing' ? 'text-primary font-medium' : 'text-foreground/80 hover:text-primary'
              )}
            >
              Price
            </Link>
          </SheetClose>
        </>
      );
    }
    
    return (
      <>
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
      </>
    );
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-lg border-b border-primary/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="w-[180px] 2xl:w-[200px] flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="font-poppins text-xl font-bold text-primary">
                InfiniteTalk AI
              </span>
            </Link>
          </div>

          {/* Middle: Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-center flex-1 ">
            <div className="flex items-center space-x-1">
              {renderNavLinks(false)}
            </div>
          </div>

          {/* Right Section */}
          <div className="w-[180px] 2xl:w-[200px] flex items-center justify-end gap-2">
            {/* Desktop: Auth Button */}
            <div className="hidden md:flex items-center gap-4">
              {/* 用户积分显示 */}
              {isSignedIn && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Coins className="h-4 w-4" />
                  <span>
                    {isLoadingUserInfo ? '...' : userInfo?.total_credits || '0'}
                  </span>
                </div>
              )}
              <AuthButton />
            </div>

            {/* Mobile: Auth Button + Menu */}
            <div className="flex md:hidden items-center gap-2">
              {/* 移动端用户积分显示 */}
              {isSignedIn && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Coins className="h-3 w-3" />
                  <span>
                    {isLoadingUserInfo ? '...' : userInfo?.total_credits || '0'}
                  </span>
                </div>
              )}
              <AuthButton />
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-foreground hover:text-primary hover:bg-muted">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[340px] px-6 pt-12 pb-8 bg-background">
                  <SheetHeader className="mb-4 text-left">
                    <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4">
                    {renderNavLinks(true)}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 