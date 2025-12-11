'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMaintenanceBanner } from './MaintenanceBannerContext';

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

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // Get site ID from environment variable or default to 'infinitetalk'
        const siteId = 'infinitetalk';
        
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
  }, []);

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
          <span className="text-center">
            {formatMessage(config.message)}
          </span>
        </div>
      </div>
    </div>
  );
}

    