'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface MaintenanceBannerContextType {
  isBannerVisible: boolean;
  setBannerVisible: (visible: boolean) => void;
  bannerHeight: number;
  setBannerHeight: (height: number) => void;
}

const MaintenanceBannerContext = createContext<MaintenanceBannerContextType | undefined>(undefined);

export function MaintenanceBannerProvider({ children }: { children: ReactNode }) {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  return (
    <MaintenanceBannerContext.Provider
      value={{
        isBannerVisible,
        setBannerVisible: setIsBannerVisible,
        bannerHeight,
        setBannerHeight,
      }}
    >
      {children}
    </MaintenanceBannerContext.Provider>
  );
}

export function useMaintenanceBanner() {
  const context = useContext(MaintenanceBannerContext);
  if (context === undefined) {
    throw new Error('useMaintenanceBanner must be used within a MaintenanceBannerProvider');
  }
  return context;
}

