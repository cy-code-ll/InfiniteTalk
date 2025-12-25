'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdBanner } from '../adBanner/AdBannerContext';

const AD_BANNER_IMAGE_URL = 'https://cfsource.infinitetalk.net/infinitetalk/banner.gif';
const AD_BANNER_MOBILE_IMAGE_URL = 'https://cfsource.infinitetalk.net/infinitetalk/bannershouji.gif';

export function AdBanner() {
  const pathname = usePathname();
  const bannerRef = useRef<HTMLDivElement>(null);
  const mobileImageRef = useRef<HTMLImageElement>(null);
  const desktopImageRef = useRef<HTMLImageElement>(null);
  const { setAdBannerVisible, setAdBannerHeight } = useAdBanner();

  // Don't show banner on /christmas page
  const shouldShowBanner = pathname !== '/christmas';

  // Update banner height when image loads
  const updateHeight = useCallback(() => {
    if (bannerRef.current) {
      const height = bannerRef.current.offsetHeight;
      setAdBannerHeight(height);
    }
  }, [setAdBannerHeight]);

  useEffect(() => {
    // Don't show banner on /christmas page
    if (!shouldShowBanner) {
      setAdBannerVisible(false);
      setAdBannerHeight(0);
      return;
    }

    // Show banner immediately
    setAdBannerVisible(true);

    // Update height when images load (check both mobile and desktop images)
    const mobileImage = mobileImageRef.current;
    const desktopImage = desktopImageRef.current;
    
    const checkAndUpdateHeight = () => {
      // Check mobile image (visible on small screens)
      if (mobileImage) {
        if (mobileImage.complete) {
          updateHeight();
        } else {
          mobileImage.addEventListener('load', updateHeight);
        }
      }
      
      // Check desktop image (visible on medium+ screens)
      if (desktopImage) {
        if (desktopImage.complete) {
          updateHeight();
        } else {
          desktopImage.addEventListener('load', updateHeight);
        }
      }
    };
    
    checkAndUpdateHeight();

    // Also update height on resize
    const handleResize = () => {
      updateHeight();
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      if (mobileImage) {
        mobileImage.removeEventListener('load', updateHeight);
      }
      if (desktopImage) {
        desktopImage.removeEventListener('load', updateHeight);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [setAdBannerVisible, updateHeight, shouldShowBanner, setAdBannerHeight]);

  // Don't render banner on /christmas page
  if (!shouldShowBanner) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      className={cn(
        'sticky top-0 left-0 right-0 z-[60] border-b',
        'flex items-center justify-center'
      )}
      style={{ backgroundColor: '#760103' }}
    >
      <div className="max-w-8xl mx-auto w-full md:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center w-full">
          <Link href="/christmas" className="block w-full md:max-w-[1920px] md:mx-auto">
            {/* Mobile image */}
            <img
              ref={mobileImageRef}
              src={AD_BANNER_MOBILE_IMAGE_URL}
              alt="Advertisement banner"
              className="w-full h-auto object-contain block cursor-pointer md:hidden"
              onLoad={updateHeight}
            />
            {/* Desktop image */}
            <img
              ref={desktopImageRef}
              src={AD_BANNER_IMAGE_URL}
              alt="Advertisement banner"
              className="w-full h-auto object-contain block cursor-pointer hidden md:block"
              onLoad={updateHeight}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
