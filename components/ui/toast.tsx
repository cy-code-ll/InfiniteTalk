'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-100 border-green-500' :
                 type === 'error' ? 'bg-red-100 border-red-500' :
                 'bg-blue-100 border-blue-500';
  
  const textColor = type === 'success' ? 'text-green-800' :
                   type === 'error' ? 'text-red-800' :
                   'text-blue-800';
  
  const iconColor = type === 'success' ? 'text-green-500' :
                   type === 'error' ? 'text-red-500' :
                   'text-blue-500';

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg shadow-lg border-l-4 ${bgColor}`} role="alert">
      <div className={`text-sm font-medium ${textColor}`}>{message}</div>
      <button 
        type="button" 
        className={`ml-auto -mx-1.5 -my-1.5 ${iconColor} rounded-lg p-1.5 hover:opacity-75 inline-flex items-center justify-center h-8 w-8`}
        onClick={onClose}
      >
        <X size={16} />
      </button>
    </div>
  );
}; 