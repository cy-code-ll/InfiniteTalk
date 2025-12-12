'use client';

import React from 'react';
import { useAdBanner } from '@/components/AdBannerContext';
import { useMaintenanceBanner } from '@/components/MaintenanceBannerContext';

export function ChristmasPageWrapper({ children }: { children: React.ReactNode }) {
  const { isAdBannerVisible, adBannerHeight } = useAdBanner();
  const { isBannerVisible, bannerHeight } = useMaintenanceBanner();
  
  // Calculate total header height: ad banner + maintenance banner + navbar (64px = h-16)
  // If ad banner is visible but height is 0 (image not loaded yet), use a minimum height estimate
  const adBannerEffectiveHeight = isAdBannerVisible 
    ? (adBannerHeight > 0 ? adBannerHeight : 80) // Use 60px as fallback if height not calculated yet
    : 0;
  
  const totalHeaderHeight = adBannerEffectiveHeight + 
                            (isBannerVisible ? bannerHeight : 0) + 
                            64; // Navbar height (h-16 = 64px)

  return (
    <div 
      className="flex flex-col md:min-h-screen overflow-hidden md:overflow-visible md:h-auto"
      style={{
        height: `calc(100dvh - ${totalHeaderHeight}px)`,
      }}
    >
      {children}
    </div>
  );
}

