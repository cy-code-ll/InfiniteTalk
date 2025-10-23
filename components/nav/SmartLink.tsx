'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { MouseEvent, useCallback } from 'react';

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClosed?: () => void; // 可选：第3帧做清理
};

export default function SmartLink({ href, children, className, onClosed }: Props) {
  const router = useRouter();

  const prefetch = useCallback(() => {
    try { router.prefetch?.(href); } catch {}
  }, [router, href]);

  const onPointer = useCallback(() => { prefetch(); }, [prefetch]);
  const onTouchStart = onPointer;

  const onClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // 帧 1：先关闭抽屉，给用户反馈
    requestAnimationFrame(() => {
      // 触发外部关闭（父组件里 setIsMobileMenuOpen(false)）
      const ev = new CustomEvent('drawer-close'); // 简易事件，可选
      window.dispatchEvent(ev);

      // 帧 2：再导航
      requestAnimationFrame(() => {
        router.push(href);

        // 帧 3：可选的收尾
        if (onClosed) {
          requestAnimationFrame(() => onClosed());
        }
      });
    });
  }, [href, router, onClosed]);

  return (
    <Link
      href={href}
      prefetch={false}
      onPointerDown={onPointer}
      onTouchStart={onTouchStart}
      onClick={onClick}
      className={className}
    >
      {children}
    </Link>
  );
}
