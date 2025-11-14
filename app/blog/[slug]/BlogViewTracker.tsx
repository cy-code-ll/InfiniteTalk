'use client';

import { useEffect, useRef } from 'react';
import { cmsApi } from '../../../lib/api';

interface BlogViewTrackerProps {
  url: string;
}

export default function BlogViewTracker({ url }: BlogViewTrackerProps) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // 防止重复调用（React Strict Mode 在开发环境下会调用两次）
    if (hasTracked.current) {
      return;
    }

    // 页面加载时发送统计请求
    const trackView = async () => {
      try {
        if (url) {
          hasTracked.current = true;
          console.log('Tracking blog view:', url);
          await cmsApi.trackBlogClick(url);
          console.log('Blog view tracked successfully:', url);
        }
      } catch (error) {
        // 静默失败，不影响用户体验
        console.error('Failed to track blog view:', error);
        // 如果失败，重置标记以便重试
        hasTracked.current = false;
      }
    };

    trackView();
  }, [url]);

  // 这个组件不渲染任何内容
  return null;
}

