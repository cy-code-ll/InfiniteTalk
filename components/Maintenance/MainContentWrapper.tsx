'use client';

import React from 'react';
import { useMaintenanceBanner } from '@/components/Maintenance/MaintenanceBannerContext';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { isBannerVisible, bannerHeight } = useMaintenanceBanner();
  
  // Calculate total header height: maintenance banner + navbar (64px = h-16)
  const totalHeaderHeight = (isBannerVisible ? bannerHeight : 0) + 
                            64; // Navbar height (h-16 = 64px)

  return (
    <main 
      style={{ 
        minHeight: `calc(100vh - ${totalHeaderHeight}px)`,
      }}
    >
      {children}
    </main>
  );
}

