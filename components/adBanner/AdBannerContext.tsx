'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdBannerContextType {
  isAdBannerVisible: boolean;
  setAdBannerVisible: (visible: boolean) => void;
  adBannerHeight: number;
  setAdBannerHeight: (height: number) => void;
}

const AdBannerContext = createContext<AdBannerContextType | undefined>(undefined);

export function AdBannerProvider({ children }: { children: ReactNode }) {
  const [isAdBannerVisible, setIsAdBannerVisible] = useState(false);
  const [adBannerHeight, setAdBannerHeight] = useState(0);

  return (
    <AdBannerContext.Provider
      value={{
        isAdBannerVisible,
        setAdBannerVisible: setIsAdBannerVisible,
        adBannerHeight,
        setAdBannerHeight,
      }}
    >
      {children}
    </AdBannerContext.Provider>
  );
}

export function useAdBanner() {
  const context = useContext(AdBannerContext);
  if (context === undefined) {
    throw new Error('useAdBanner must be used within an AdBannerProvider');
  }
  return context;
}

