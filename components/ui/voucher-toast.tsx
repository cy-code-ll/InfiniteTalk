'use client';

import React, { useEffect } from 'react';
import { X, Gift } from 'lucide-react';

interface VoucherToastProps {
  count: number;
  onClose: () => void;
}

export const VoucherToast: React.FC<VoucherToastProps> = ({ count, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-[80]">
      <div className="relative flex items-start gap-3 rounded-2xl bg-slate-900/95 px-4 py-3 shadow-xl border border-slate-700/70 backdrop-blur-md min-w-[280px] max-w-[360px]">
        <div className="absolute inset-x-0 -top-[1px] h-[2px] rounded-t-2xl bg-gradient-to-r from-lime-300 via-emerald-300 to-sky-300" />

        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-lime-500/20 text-lime-300">
          <Gift className="h-5 w-5" />
        </div>

        <div className="flex-1">
          <div className="text-sm font-semibold text-slate-50">
            {count} trial vouchers for you.
          </div>
          <div className="mt-1 text-xs text-slate-300 leading-snug">
            You can use these vouchers to try out any model you wish.
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close voucher toast"
          className="mt-1 ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};


