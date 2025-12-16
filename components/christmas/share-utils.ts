// Christmas 页面分享工具函数

export type SocialPlatform = 'twitter' | 'facebook' | 'whatsapp';

// 分享链接基础地址配置
// const SHARE_BASE_URLS = {
//   // 测试版地址
//   test: 'https://infinitetalk-chirsmas-share.vercel.app/infinitetalk/christmas2',
//   // 正式版地址
//   production: 'https://www.infinitetalk2.com/infinitetalk/christmas',
// } as const;


/**
 * 从视频 URL 中提取日期部分
 * @param videoUrl - 视频 URL，格式如：https://cf.infinitetalk.net/topic_1/infinitetalk/2512/16/44748.mp4
 * @returns 日期字符串，格式如：2512-16-44748
 */
const extractDateFromVideoUrl = (videoUrl: string): string | null => {
  try {
    // 匹配 /infinitetalk/数字/数字/数字.mp4 的模式
    const match = videoUrl.match(/\/infinitetalk\/(\d+)\/(\d+)\/(\d+)\.mp4/);
    if (match && match.length === 4) {
      // 返回 2512-16-44748 格式
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return null;
  } catch (error) {
    console.error('Failed to extract date from video URL:', error);
    return null;
  }
};

/**
 * 生成 Christmas 视频分享链接
 * @param videoUrl - 生成后的视频 URL，格式如：https://cf.infinitetalk.net/topic_1/infinitetalk/2512/16/44748.mp4
 * @param templateId - 模板 ID (如 't1', 't2', 't3')
 * @param musicId - 音乐 ID (如 'm1', 'm2', ...)
 * @returns 分享页面 URL，格式：
 *   - 测试版：https://infinitetalk-chirsmas-share.vercel.app/infinitetalk/christmas2/2512-16-44748-templateId-musicId.html
 *   - 正式版：https://www.infinitetalk2.com/infinitetalk/christmas/2512-16-44748-templateId-musicId.html
 */
export const generateChristmasShareUrl = (
  videoUrl: string,
  templateId: string,
  musicId: string
): string => {
  // 根据当前环境选择基础地址
  // 测试版 https://infinitetalk-chirsmas-share.vercel.app/infinitetalk/christmas2
  // 正式版 https://www.infinitetalk2.com/infinitetalk/christmas
  const baseUrl = 'https://infinitetalk-chirsmas-share.vercel.app/infinitetalk/christmas2';
  
  // 从视频 URL 中提取日期部分
  const datePart = extractDateFromVideoUrl(videoUrl);
  
  if (!datePart) {
    // 如果无法提取日期，使用旧的查询参数格式作为后备方案
    console.warn('Failed to extract date from video URL, using fallback format');
    const params = new URLSearchParams({
      v: videoUrl,
      tid: templateId,
      mid: musicId,
    });
    return `${baseUrl}.html?${params.toString()}`;
  }
  
  // 生成新格式的分享链接：christmas2/2512-16-44748-templateId-musicId.html
  return `${baseUrl}/${datePart}-${templateId}-${musicId}.html`;
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

