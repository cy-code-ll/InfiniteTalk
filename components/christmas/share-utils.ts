// Christmas 页面分享工具函数

export type SocialPlatform = 'twitter' | 'facebook' | 'whatsapp';

/**
 * 生成 Christmas 视频分享链接
 * @param videoUrl - 生成后的视频 URL
 * @param templateId - 模板 ID (如 't1', 't2', 't3')
 * @param musicId - 音乐 ID (如 'm1', 'm2', ...)
 * @returns 分享页面 URL，格式：example.com?v=https://123.mp4&tid=t1&mid=m1
 */
export const generateChristmasShareUrl = (
  videoUrl: string,
  templateId: string,
  musicId: string
): string => {
  const baseUrl = 'https://www.infinitetalk2.com/infinitetalk/christmas.html';
  const sharePageUrl = `${baseUrl}`;
  
  // 构建查询参数
  const params = new URLSearchParams({
    v: videoUrl,
    tid: templateId,
    mid: musicId,
  });
  
  return `${sharePageUrl}?${params.toString()}`;
};

/**
 * 生成分享文案
 * @param platform - 社交媒体平台
 * @returns 分享文案
 */
const getShareText = (platform: SocialPlatform): string => {
  switch (platform) {
    case 'twitter':
      return 'Check out my amazing Christmas greeting video! 🎄✨';
    case 'facebook':
      return 'I just created a personalized Christmas greeting video! Check it out! 🎅🎁';
    case 'whatsapp':
      return '🎄 Merry Christmas! Check out my personalized Christmas greeting video! 🎅';
    default:
      return 'Check out my amazing Christmas greeting video!';
  }
};

/**
 * 生成社交媒体分享链接
 * @param videoUrl - 生成后的视频 URL
 * @param templateId - 模板 ID
 * @param musicId - 音乐 ID
 * @param platform - 社交媒体平台
 * @returns 社交媒体分享 URL
 */
export const generateSocialShareUrl = (
  videoUrl: string,
  templateId: string,
  musicId: string,
  platform: SocialPlatform
): string => {
  const sharePageUrl = generateChristmasShareUrl(videoUrl, templateId, musicId);
  const shareText = getShareText(platform);
  
  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodeURIComponent(sharePageUrl)}&text=${encodeURIComponent(shareText)}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sharePageUrl)}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + sharePageUrl)}`;
    
    default:
      return sharePageUrl;
  }
};

/**
 * 打开社交媒体分享窗口
 * @param videoUrl - 生成后的视频 URL
 * @param templateId - 模板 ID
 * @param musicId - 音乐 ID
 * @param platform - 社交媒体平台
 */
export const shareChristmasToSocial = (
  videoUrl: string,
  templateId: string,
  musicId: string,
  platform: SocialPlatform
): void => {
  const shareUrl = generateSocialShareUrl(videoUrl, templateId, musicId, platform);
  
  // 打开新窗口进行分享
  window.open(
    shareUrl,
    '_blank',
    'width=600,height=400,menubar=no,toolbar=no,location=no'
  );
};

/**
 * 复制分享链接到剪贴板
 * @param videoUrl - 生成后的视频 URL
 * @param templateId - 模板 ID
 * @param musicId - 音乐 ID
 * @returns Promise<boolean> - 是否成功复制
 */
export const copyChristmasShareLink = async (
  videoUrl: string,
  templateId: string,
  musicId: string
): Promise<boolean> => {
  const sharePageUrl = generateChristmasShareUrl(videoUrl, templateId, musicId);
  
  try {
    await navigator.clipboard.writeText(sharePageUrl);
    return true;
  } catch (error) {
    console.error('Failed to copy link:', error);
    return false;
  }
};

