// 分享工具函数

export type SocialPlatform = 'twitter' | 'facebook' | 'whatsapp';

/**
 * 生成分享链接
 * @param taskId - 视频的 task_id
 * @param platform - 社交媒体平台
 * @returns 分享 URL
 */
export const generateShareUrl = (taskId: string, platform: SocialPlatform): string => {
  // 视频分享落地页 URL
  const videoPageUrl = `${window.location.origin}/share/${taskId}`;
  
  // 分享文案
  const shareText = 'Check out this amazing video I created with InfiniteTalk!';
  
  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoPageUrl)}&text=${encodeURIComponent(shareText)}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(videoPageUrl)}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + videoPageUrl)}`;
    
    default:
      return videoPageUrl;
  }
};

/**
 * 打开分享窗口
 * @param taskId - 视频的 task_id
 * @param platform - 社交媒体平台
 */
export const shareToSocial = (taskId: string, platform: SocialPlatform): void => {
  const shareUrl = generateShareUrl(taskId, platform);
  
  // 打开新窗口进行分享
  window.open(
    shareUrl,
    '_blank',
    'width=600,height=400,menubar=no,toolbar=no,location=no'
  );
};

/**
 * 复制分享链接到剪贴板
 * @param taskId - 视频的 task_id
 * @returns Promise<boolean> - 是否成功复制
 */
export const copyShareLink = async (taskId: string): Promise<boolean> => {
  const videoPageUrl = `${window.location.origin}/share/${taskId}`;
  
  try {
    await navigator.clipboard.writeText(videoPageUrl);
    return true;
  } catch (error) {
    console.error('Failed to copy link:', error);
    return false;
  }
};

