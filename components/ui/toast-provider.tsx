'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Toast } from '@/components/ui/toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: ToastType;
  }>({
    show: false,
    message: '',
    type: 'info'
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({
      show: true,
      message,
      type
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const success = (message: string) => {
    console.log('Success:', message);
    showToast(message, 'success');
  };

  const error = (message: string) => {
    console.error('Error:', message);
    showToast(message, 'error');
  };

  const info = (message: string) => {
    console.log('Info:', message);
    showToast(message, 'info');
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
