'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, startTransition } from 'react';
import { CustomSignModal } from './custom-sign-modal';

type View = 'signin' | 'signup' | 'verify-email';

interface AuthModalContextValue {
  openAuthModal: (initialView?: View) => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue>({
  openAuthModal: () => {},
  closeAuthModal: () => {},
});

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [forceMount, setForceMount] = useState(false);
  const [initialView, setInitialView] = useState<View>('signin');

  // Preload the modal during idle time or first input to avoid INP spikes
  useEffect(() => {
    let timeoutId: any;
    const idle = (cb: () => void) => {
      const ric: any = (window as any).requestIdleCallback;
      if (ric) {
        ric(cb, { timeout: 1200 });
      } else {
        timeoutId = setTimeout(cb, 1200);
      }
    };
    const onFirstInput = () => {
      setForceMount(true);
      window.removeEventListener('pointerdown', onFirstInput);
      window.removeEventListener('touchstart', onFirstInput);
    };
    window.addEventListener('pointerdown', onFirstInput, { once: true });
    window.addEventListener('touchstart', onFirstInput, { once: true });
    idle(() => setForceMount(true));
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('pointerdown', onFirstInput);
      window.removeEventListener('touchstart', onFirstInput);
    };
  }, []);

  const openAuthModal = useCallback((view: View = 'signin') => {
    setInitialView(view);
    // Defer to next frame to keep the user input task short
    requestAnimationFrame(() => {
      startTransition(() => setOpen(true));
    });
  }, []);

  const closeAuthModal = useCallback(() => {
    setOpen(false);
  }, []);

  const value = useMemo<AuthModalContextValue>(() => ({ openAuthModal, closeAuthModal }), [openAuthModal, closeAuthModal]);

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <CustomSignModal open={open} onOpenChange={setOpen} initialView={initialView} forceMount={forceMount} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalContextValue {
  return useContext(AuthModalContext);
}


