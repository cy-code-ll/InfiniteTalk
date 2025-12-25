'use client';

import React from 'react';
import Link from 'next/link';
import { NavClient } from './nav/NavClient';
import { useMaintenanceBanner } from './Maintenance/MaintenanceBannerContext';
import { useAdBanner } from './adBanner/AdBannerContext';

export function Navbar() {
  const { isBannerVisible, bannerHeight } = useMaintenanceBanner();
  const { isAdBannerVisible, adBannerHeight } = useAdBanner();
  
  // Calculate top position based on both banners visibility
  const totalBannerHeight = (isAdBannerVisible ? adBannerHeight : 0) + (isBannerVisible ? bannerHeight : 0);
  const topPosition = totalBannerHeight > 0 ? `${totalBannerHeight}px` : '0px';

  return (
    <nav 
      className="sticky left-0 right-0 z-50 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-lg border-b border-primary/20 shadow-xl"
      style={{ top: topPosition }}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="w-[180px] 2xl:w-[200px] flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-poppins text-xl font-bold text-primary">
                InfiniteTalk
              </span>
            </Link>
          </div>

          {/* Middle & Right: Client-side interactive parts */}
          <NavClient />
        </div>
      </div>
    </nav>
  );
}
