'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export default function FastMenu({
  trigger,
  children,
  align = 'end',
}: {
  trigger: (open: () => void) => React.ReactNode;
  children: (close: () => void) => React.ReactNode;
  align?: 'start' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openMenu = () => {
    requestAnimationFrame(() => setOpen(true));
  };
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc, true);
    return () => document.removeEventListener('mousedown', onDoc, true);
  }, [open]);

  return (
    <div className="relative">
      <div ref={btnRef} onClick={openMenu}>
        {trigger(openMenu)}
      </div>
      <div
        ref={panelRef}
        className={cn(
          'absolute mt-2 min-w-[14rem] rounded-md border bg-popover text-popover-foreground shadow-md',
          'transition-all duration-150 will-change-transform origin-top-right',
          align === 'end' ? 'right-0' : 'left-0',
          open ? 'opacity-100 translate-y-0 scale-100'
               : 'pointer-events-none opacity-0 -translate-y-1 scale-[0.98]'
        )}
      >
        {children(closeMenu)}
      </div>
    </div>
  );
}


