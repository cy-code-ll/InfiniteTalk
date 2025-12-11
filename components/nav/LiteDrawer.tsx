'use client';

import React, { useEffect, useCallback, useRef } from 'react';

interface LiteDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export const LiteDrawer: React.FC<LiteDrawerProps> = ({
  open,
  onOpenChange,
  children,
  className = '',
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 使用 rAF 批量更新样式，避免多次重排
  const updateStyles = useCallback(() => {
    if (open) {
      const isMobile = window.innerWidth < 768;
      
      requestAnimationFrame(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
        if (!isMobile) {
          const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
          document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
          document.body.style.paddingRight = '0px';
        }
      });
    } else {
      requestAnimationFrame(() => {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.documentElement.style.overflowX = '';
      });
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, onOpenChange]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    updateStyles();
  }, [updateStyles]);

  const handleOverlayClick = useCallback(() => {
    requestAnimationFrame(() => {
      onOpenChange(false);
    });
  }, [onOpenChange]);

  return (
    <>
      {/* Overlay - always in DOM */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={`fixed inset-0 bg-slate-950/80 transition-opacity duration-200 ease-out ${
          open ? 'opacity-100 pointer-events-auto z-40' : 'opacity-0 pointer-events-none -z-10'
        }`}
        aria-hidden={!open}
      />

      {/* Drawer Panel - always in DOM */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="false"
        aria-hidden={!open}
        className={`fixed top-0 bottom-0 h-dvh max-h-dvh w-[85vw] sm:w-[340px] bg-slate-900 shadow-2xl transition-transform duration-200 ease-out z-50 overflow-y-auto overscroll-contain touch-pan-y ${
          open 
            ? 'translate-x-0 pointer-events-auto right-0' 
            : 'translate-x-full pointer-events-none right-0'
        } [will-change:transform] ${className}`}
      >
        {children}
      </div>
    </>
  );
};

interface LiteDrawerCloseProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const LiteDrawerClose: React.FC<LiteDrawerCloseProps> = ({ onClose, children }) => {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    requestAnimationFrame(() => {
      onClose();
    });
  }, [onClose]);

  return (
    <div onClick={handleClick}>
      {children}
    </div>
  );
};

