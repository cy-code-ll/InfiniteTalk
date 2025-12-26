'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaintenanceModalConfig {
  enabled: boolean;
  startTime: string;
  endTime: string;
  severity: 'info' | 'warning' | 'error';
  modal: {
    enabled: boolean;
    title: string;
    message: string;
  };
}

interface MaintenanceNotice {
  sites: {
    [key: string]: MaintenanceModalConfig;
  };
}

export function MaintenanceModal() {
  const [config, setConfig] = useState<MaintenanceModalConfig | null>(null);
  const [isVisible, setIsVisible] = useState(false);

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

        // Check if maintenance modal is enabled
        if (siteConfig.enabled && siteConfig.modal.enabled) {
          setConfig(siteConfig);
          setIsVisible(true);
        }
      } catch (error) {
        // Silently fail - don't show modal if there's an error
        console.error('Failed to fetch maintenance notice:', error);
      }
    };

    fetchConfig();
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible || !config) {
    return null;
  }

  // Severity-based styling for modal content
  const severityStyles = {
    info: {
      border: 'border-blue-500',
      icon: 'text-blue-500',
      title: 'text-blue-700',
    },
    warning: {
      border: 'border-yellow-500',
      icon: 'text-yellow-500',
      title: 'text-yellow-700',
    },
    error: {
      border: 'border-red-500',
      icon: 'text-red-500',
      title: 'text-red-700',
    },
  };

  const styles = severityStyles[config.severity];

  return (
    <div
      className="fixed inset-0 z-[100]"
    >
      {/* Backdrop - fully transparent overlay that blocks all interaction */}
      <div
        className="absolute inset-0 pointer-events-auto"
      />

      {/* Modal Content - positioned at top right */}
      <div
        className={cn(
          'fixed top-10 right-4 z-10 w-full max-w-md bg-white rounded-lg shadow-2xl border-l-4 pointer-events-auto',
          styles.border,
          'transform transition-all'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertCircle className={cn('h-6 w-6', styles.icon)} />
            <h2 className={cn('text-xl font-semibold', styles.title)}>
              {config.modal.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">
            {config.modal.message}
          </p>
        </div>
      </div>
    </div>
  );
}

