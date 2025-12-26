'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMaintenanceBanner } from './MaintenanceBannerContext';
import { useUser } from '@clerk/nextjs';

interface MaintenanceConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
}

interface MaintenanceNotice {
  sites: {
    [key: string]: MaintenanceConfig;
  };
}

export function MaintenanceBanner() {
  const [config, setConfig] = useState<MaintenanceConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const { setBannerVisible, setBannerHeight } = useMaintenanceBanner();
  const { isSignedIn, user } = useUser();
  const siteId = 'infinitetalk';

  // Check if banner was dismissed by this user
  const getDismissalKey = () => {
    if (!user?.id) return null;
    return `maintenance-banner-dismissed-${siteId}-${user.id}`;
  };

  const isDismissed = () => {
    if (typeof window === 'undefined') return false;
    const key = getDismissalKey();
    if (!key) return false;
    return localStorage.getItem(key) === 'true';
  };

  const handleDismiss = () => {
    const key = getDismissalKey();
    if (key && typeof window !== 'undefined') {
      localStorage.setItem(key, 'true');
      setIsVisible(false);
      setBannerVisible(false);
    }
  };

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Only show banner for signed-in users
        if (!isSignedIn || !user?.id) {
          return;
        }

        // Check if user has dismissed the banner
        if (isDismissed()) {
          return;
        }
        
        const response = await fetch('https://cysource.jxp.com/public/maintenance-notice.json', {
          cache: 'no-store', // Always fetch fresh data
        });
        
        if (!response.ok) {
          return;
        }

        const data: MaintenanceNotice = await response.json();
        const siteConfig = data.sites[siteId];

        if (!siteConfig) {
          return;
        }

        // Check if maintenance notice is enabled
        if (siteConfig.enabled) {
          setConfig(siteConfig);
          setIsVisible(true);
          setBannerVisible(true);
        }
      } catch (error) {
        // Silently fail - don't show banner if there's an error
        console.error('Failed to fetch maintenance notice:', error);
      }
    };

    fetchConfig();
  }, [isSignedIn, user?.id]);

  // Format UTC time to local time for display
  const formatLocalTime = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      // Get local time components
      const month = date.getMonth();
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      // Month names
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      
      // Format as "December 25, 10:00" (local time)
      return `${monthNames[month]} ${day}, ${hours}:${minutes}`;
    } catch {
      return isoString;
    }
  };

  // Replace placeholders in message
  const formatMessage = (message: string): string => {
    if (!config) return message;
    
    const startTimeDisplay = formatLocalTime(config.startTime);
    const endTimeDisplay = formatLocalTime(config.endTime);
    
    return message
      .replace('{startTime}', startTimeDisplay)
      .replace('{endTime}', endTimeDisplay);
  };

  // Update banner height when visible
  useEffect(() => {
    if (isVisible && bannerRef.current) {
      const height = bannerRef.current.offsetHeight;
      setBannerHeight(height);
    } else {
      setBannerHeight(0);
    }
  }, [isVisible, setBannerHeight]);

  if (!isVisible || !config) {
    return null;
  }

  // Severity-based styling
  const severityStyles = {
    info: 'bg-blue-600/90 text-white border-blue-500',
    warning: 'bg-yellow-600/90 text-white border-yellow-500',
    error: 'bg-red-600/90 text-white border-red-500',
  };

  return (
    <div
      ref={bannerRef}
      className={cn(
        'sticky top-0 left-0 right-0 z-[60] border-b',
        severityStyles[config.severity]
      )}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-3 text-sm">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="text-center flex-1">
            {formatMessage(config.message)}
          </span>
          <button
            onClick={handleDismiss}
            className="ml-4 flex-shrink-0 p-1 rounded-md hover:bg-white/20 transition-colors"
            aria-label="Close maintenance notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

    