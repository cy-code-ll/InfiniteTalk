'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAdBanner } from './AdBannerContext';

const AD_BANNER_IMAGE_URL = 'https://cfsource.infinitetalk.net/infinitetalk/banner.gif';

export function AdBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { setAdBannerVisible, setAdBannerHeight } = useAdBanner();

  // Update banner height when image loads
  const updateHeight = useCallback(() => {
    if (bannerRef.current) {
      const height = bannerRef.current.offsetHeight;
      setAdBannerHeight(height);
    }
  }, [setAdBannerHeight]);

  useEffect(() => {
    // Show banner immediately
    setAdBannerVisible(true);

    // Update height when image loads
    const image = imageRef.current;
    if (image) {
      if (image.complete) {
        // Image already loaded
        updateHeight();
      } else {
        // Wait for image to load
        image.addEventListener('load', updateHeight);
      }
    }

    // Also update height on resize
    const handleResize = () => {
      updateHeight();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (image) {
        image.removeEventListener('load', updateHeight);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [setAdBannerVisible, updateHeight]);

  return (
    <div
      ref={bannerRef}
      className={cn(
        'sticky top-0 left-0 right-0 z-[60] border-b',
        'flex items-center justify-center'
      )}
      style={{ backgroundColor: '#760103' }}
    >
      <div className="max-w-8xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center w-full">
          <Link href="/christmas" className="block w-full max-w-[1920px] mx-auto">
            <img
              ref={imageRef}
              src={AD_BANNER_IMAGE_URL}
              alt="Advertisement banner"
              className="w-full h-auto object-contain block cursor-pointer"
              onLoad={updateHeight}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
