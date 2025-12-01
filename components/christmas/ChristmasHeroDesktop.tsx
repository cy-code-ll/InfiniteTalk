'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast-provider';
import { useUser } from '@clerk/nextjs';
import { useUserInfo } from '@/lib/providers';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { api } from '@/lib/api';
import { shareChristmasToSocial } from './share-utils';
import { Upload, Music2, Download, X, Loader2, Sparkles, Volume2, VolumeX } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

// 下载媒体文件的函数（从 InfiniteTalkGenerator 复制）
async function downloadMediaWithCors(
  mediaUrl: string,
  filename: string,
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void
) {
  try {
    const response = await fetch(mediaUrl, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}. Failed to fetch media. Check CORS headers on the server.`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename || `christmas-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
    console.log('Media download initiated!');
    if (showToast) showToast('Video downloaded successfully!', 'success');
  } catch (error: any) {
    console.error('Download failed:', error);
    const errorMessage = 'Download failed!';
    if (showToast) {
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        showToast(`${errorMessage} - CORS error. Check server configuration.`, 'error');
      } else {
        showToast(`${errorMessage} ${error.message}`, 'error');
      }
    }
  }
}

// 两种主状态：展示 / 制作
type ViewState = 'display' | 'create';
type ImageOrientation = 'portrait' | 'landscape' | null;
type Resolution = '480p' | '720p' | '1080p';

// 积分计算规则，与 InfiniteTalk 保持一致
function calculateCredits(duration: number, resolution: Resolution): number {
  if (!duration) return 1;
  const rounded = Math.ceil(duration);

  if (rounded <= 5) {
    if (resolution === '480p') return 5 + 1;
    if (resolution === '720p') return 10 + 1;
    return 15 + 1;
  }

  const perSecond = resolution === '480p' ? 1 : resolution === '720p' ? 2 : 3;
  return rounded * perSecond + 1;
}

const sampleVideos = [
  {
    id: 1,
    src: 'https://www.infinitetalk2.com/infinitetalk/h2.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/h2.webp',
    poster: '/video/christmas/santa-decorating.webp',
  },
  {
    id: 2,
    src: 'https://www.infinitetalk2.com/infinitetalk/h1.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/h1.webp',
    poster: '/video/christmas/santa-reading.webp',
  },
  {
    id: 3,
    src: 'https://www.infinitetalk2.com/infinitetalk/h3.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/h3.webp',
    poster: '/video/christmas/santa-cabin.webp',
  },
];

const TEMPLATES = [
  {
    id: 't1',
    name: 'Cozy Home',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/1.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t1.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t1.webp',
    prompt:
      '  In the suburbs of Christmas, snow falls on Christmas trees, and the roofs and windowsills of small wooden houses are covered with a thick layer of white snow. There is a flower wreath made of pine cones and red berries hanging at the door. The character is wearing a Christmas sweater, wearing a red Christmas hat, holding a Christmas card, and standing next to a small wooden house. The character width accounts for 70% of the page. The proportion of height on the page is about 70%, making people instantly feel the lively, excited, and energetic atmosphere of the festival night.',
  },
  {
    id: 't2',
    name: 'Living Room',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/2.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t2.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t2.webp',
    prompt:
      '  In the center of the living room, there is a super large and lush real pine tree! It is covered with various retro glass ball ornaments, with warm yellow white string lights on. Snow is drifting outside the window, the feeling of night. The overall atmosphere inside the house is warm, with a soft yellow color tone. The character stands at the front, holding a Christmas card, and the width of the character accounts for 70% of the page. About 70% of the page is high, wearing an ugly Christmas sweater printed on it',
  },
  {
    id: 't3',
    name: 'Church Interior',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/3.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t3.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t3.webp',
    prompt:
      '  The interior of the Christmas church is decorated with a large number of green holly branches and red potted poinsettias in the night background. The main lighting comes from chandeliers and lit candles. The character is in the center of the video, wearing a red Christmas hat, and the width of the character accounts for 70% of the page. The height accounts for about 70% of the page, wearing an ugly Christmas sweater, making people instantly feel the lively, excited, and energetic atmosphere of the holiday night.',
  },
  {
    id: 't4',
    name: 'Pine Forest',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/4.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t4.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t4.webp',
    prompt:
      '  A pine forest in the outskirts, covered in snow on the ground, with yellow lights shining from the windows of the small wooden houses on the farm, warm and romantic. Most importantly, countless warm light strings, only white or amber, are wrapped around the pine trees in the forest, outlining their contours. As dusk falls and the lights begin to dominate the view, the entire scene becomes poetic and romantic. The character is wearing a Christmas sweater and a red Christmas hat, with a width of 70% of the page. The proportion of height on the page is about 70%, making people instantly feel the lively, excited, and energetic atmosphere of the festival night.',
  }
];

const MUSIC_TRACKS = [
  { id: 'm9', name: 'Fairytale At Christmas', url: '/music/3.mp3', taglist: [] },
  { id: 'm7', name: 'All I Want For Christmas', url: '/music/1.mp3', taglist: [] },
  { id: 'm8', name: 'Feliz Navidad', url: '/music/2.mp3', taglist: [] },
  { id: 'm1', name: 'Female Family', url: '/music/fmale_fam.mp3', taglist: ['female'] },
  { id: 'm2', name: 'Female Friend', url: '/music/fmale_fir.mp3', taglist: ['female'] },
  { id: 'm3', name: 'Female Colleague', url: '/music/fmale_work.mp3', taglist: ['female'] },
  { id: 'm4', name: 'Male Family', url: '/music/male_fam.mp3', taglist: ['male'] },
  { id: 'm5', name: 'Male Friend', url: '/music/male_fri.mp3', taglist: ['male'] },
  { id: 'm6', name: 'Male Colleague', url: '/music/male_work.mp3', taglist: ['male'] },

];

// PC 端下雪覆盖层（只在组件内部覆盖，不影响交互）
type SnowFlake = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
};

function createSnowFlakes(count: number): SnowFlake[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: 8 + Math.random() * 8,
    size: 4 + Math.random() * 6,
    opacity: 0.4 + Math.random() * 0.5,
  }));
}

function SnowOverlay({ density = 50 }: { density?: number }) {
  // 通过 useEffect 在客户端生成随机雪花，避免 SSR / hydration 不一致
  const [flakes, setFlakes] = useState<SnowFlake[]>([]);

  useEffect(() => {
    setFlakes(createSnowFlakes(density));
  }, [density]);

  if (!flakes.length) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute rounded-full bg-white/90 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          style={{
            left: `${flake.left}%`,
            top: '-10%',
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `snow-fall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ChristmasHeroDesktop() {
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState<ViewState>('display');
  const { isSignedIn } = useUser();
  const { openAuthModal } = useAuthModal();
  const toast = useToast();
  const { userInfo } = useUserInfo();

  // create 状态相关
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageOrientation, setImageOrientation] = useState<ImageOrientation>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [prompt, setPrompt] = useState(TEMPLATES[0].prompt);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(TEMPLATES[0].id);
  const [selectedMusicId, setSelectedMusicId] = useState<string>(MUSIC_TRACKS[0].id);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentMusicId, setCurrentMusicId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [audioDuration, setAudioDuration] = useState(0);
  const [previewState, setPreviewState] = useState<'idle' | 'loading' | 'result'>('idle');
  const [progress, setProgress] = useState(0);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [resultTaskId, setResultTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] = useState(false);
  const progressTimerRef = useRef<number | null>(null);
  
  // 静音状态管理
  const [isPreviewMuted, setIsPreviewMuted] = useState(true); // 预览区视频静音状态，默认静音
  const [isDisplayVideo1Muted, setIsDisplayVideo1Muted] = useState(true); // renderDisplay 第一个视频
  const [isDisplayVideo2Muted, setIsDisplayVideo2Muted] = useState(true); // renderDisplay 第二个视频
  const [isDisplayVideo3Muted, setIsDisplayVideo3Muted] = useState(true); // renderDisplay 第三个视频

  // 从 URL 参数读取 tid 和 mid，并设置默认值
  useEffect(() => {
    if (!searchParams) return;

    const tid = searchParams.get('tid');
    const mid = searchParams.get('mid');
    const v = searchParams.get('v'); // 视频 URL

    // 设置模板
    if (tid) {
      const template = TEMPLATES.find((t) => t.id === tid);
      if (template) {
        setSelectedTemplateId(template.id);
        setPrompt(template.prompt);
      }
    }

    // 设置音乐
    if (mid) {
      const music = MUSIC_TRACKS.find((m) => m.id === mid);
      if (music) {
        setSelectedMusicId(music.id);
        // 获取音频时长
        const audioEl = new Audio();
        audioEl.crossOrigin = 'anonymous';
        audioEl.preload = 'metadata';
        audioEl.onloadedmetadata = () => {
          const duration = Math.ceil(audioEl.duration || 0);
          setAudioDuration(duration || 30);
          URL.revokeObjectURL(audioEl.src);
        };
        audioEl.onerror = () => {
          setAudioDuration(30);
          URL.revokeObjectURL(audioEl.src);
        };
        audioEl.src = music.url;
      }
    } else {
      // 如果没有 mid 参数，使用默认音乐
      const defaultTrack = MUSIC_TRACKS.find((m) => m.id === MUSIC_TRACKS[0].id);
      if (defaultTrack) {
        const audioEl = new Audio();
        audioEl.crossOrigin = 'anonymous';
        audioEl.preload = 'metadata';
        audioEl.onloadedmetadata = () => {
          const duration = Math.ceil(audioEl.duration || 0);
          setAudioDuration(duration || 30);
          URL.revokeObjectURL(audioEl.src);
        };
        audioEl.onerror = () => {
          setAudioDuration(30);
          URL.revokeObjectURL(audioEl.src);
        };
        audioEl.src = defaultTrack.url;
      }
    }

    // 如果有视频 URL，显示结果视频
    if (v) {
      setResultVideoUrl(v);
      setViewState('create');
      setPreviewState('result');
    }
  }, [searchParams]);

  // 当筛选改变时，如果当前选中的音乐不在筛选结果中，自动选择第一个可用的音乐
  useEffect(() => {
    const filteredTracks = MUSIC_TRACKS.filter((track) => {
      if (genderFilter === 'all') return true;
      return track.taglist?.includes(genderFilter);
    });
    
    const currentTrack = filteredTracks.find((track) => track.id === selectedMusicId);
    if (!currentTrack && filteredTracks.length > 0) {
      setSelectedMusicId(filteredTracks[0].id);
      // 如果正在播放，停止播放
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        setIsMusicPlaying(false);
        setCurrentMusicId(null);
      }
    }
  }, [genderFilter, selectedMusicId]);

  // 清理音乐播放
  useEffect(() => {
    return () => {
      if (musicAudioRef.current) {
        musicAudioRef.current.pause();
        musicAudioRef.current = null;
      }
      if (progressTimerRef.current) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const startFakeProgress = () => {
    setProgress(0);
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
    }
    const id = window.setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) {
          return prev + Math.random() * 1.5 + 0.5;
        }
        return prev;
      });
    }, 1200);
    progressTimerRef.current = id;
  };

  const stopFakeProgress = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 登录检查
    if (!isSignedIn) {
      requestAnimationFrame(() => openAuthModal('signin'));
      // 清空文件输入
      if (e.target) {
        e.target.value = '';
      }
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // 读取尺寸判断横竖
    const img = document.createElement('img');
    img.onload = () => {
      const orientation: ImageOrientation = img.height >= img.width ? 'portrait' : 'landscape';
      setImageOrientation(orientation);
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
    setImageOrientation(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleDownload = async () => {
    if (!resultVideoUrl) return;
    setIsDownloading(true);
    try {
      await downloadMediaWithCors(resultVideoUrl, `christmas-video-${Date.now()}.mp4`, toast.showToast);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSelectMusic = (id: string) => {
    setSelectedMusicId(id);

    const track = MUSIC_TRACKS.find((m) => m.id === id);
    if (!track) return;

    if (!musicAudioRef.current) {
      musicAudioRef.current = new Audio();
      musicAudioRef.current.crossOrigin = 'anonymous';
    }

    if (currentMusicId === id && isMusicPlaying) {
      musicAudioRef.current.pause();
      setIsMusicPlaying(false);
      return;
    }

    // 获取音频时长
    const audioEl = new Audio();
    audioEl.crossOrigin = 'anonymous';
    audioEl.preload = 'metadata';
    audioEl.onloadedmetadata = () => {
      const duration = Math.ceil(audioEl.duration || 0);
      setAudioDuration(duration || 30);
      URL.revokeObjectURL(audioEl.src);
    };
    audioEl.onerror = () => {
      setAudioDuration(30); // 默认30秒
      URL.revokeObjectURL(audioEl.src);
    };
    audioEl.src = track.url;

    musicAudioRef.current.crossOrigin = 'anonymous';
    musicAudioRef.current.src = track.url;
    musicAudioRef.current
      .play()
      .then(() => {
        setCurrentMusicId(id);
        setIsMusicPlaying(true);
      })
      .catch(() => {
        setIsMusicPlaying(false);
      });
  };

  // 从 URL 下载图片并转为 File
  const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
  };

  // 轮询 Nano Banana 任务状态
  const pollNanoBananaTask = async (taskId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = await api.nanoBanana.checkTaskStatus(taskId);
          
          if (result.code !== 200) {
            reject(new Error(result.msg || 'Task check failed'));
            return;
          }

          if (!result.data) {
            reject(new Error('No data returned from task status check'));
            return;
          }

          const { status, image_url } = result.data;

          if (status === 1) {
            // 任务完成
            if (!image_url) {
              reject(new Error('No image URL returned'));
              return;
            }
            console.log('Nano Banana task completed, image URL:', image_url);
            resolve(image_url);
          } else if (status === -1) {
            // 任务失败
            reject(new Error(result.data?.status_msg || 'Task failed'));
          } else {
            // 任务进行中，2秒后继续轮询
            setTimeout(poll, 2000);
          }
        } catch (error) {
          console.error('Error in pollNanoBananaTask:', error);
          reject(error);
        }
      };

      poll();
    });
  };

  const handleGenerateClick = async () => {
    if (!imageFile || !selectedMusicId) return;

    // Prompt 校验
    if (!prompt || !prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // 登录检查
    if (!isSignedIn) {
      requestAnimationFrame(() => openAuthModal('signin'));
      return;
    }

    if (!userInfo) {
      toast.error('User information not available, please try again');
      return;
    }

    try {
      setIsGenerating(true);
      setPreviewState('loading');
      setResultVideoUrl(null);
      setResultTaskId(null);
      startFakeProgress();

      // 使用用户输入的 prompt
      const finalPrompt = prompt.trim();

      // 步骤1: 上传图片
      // toast.showToast('Uploading image...', 'info');
      const uploadResult = await api.upload.uploadImage(imageFile);
      if (uploadResult.code !== 200 || !uploadResult.data) {
        throw new Error(uploadResult.msg || 'Failed to upload image');
      }
      const uploadedImageUrl = uploadResult.data;

      // 步骤2: 调用 Nano Banana Edit 接口
      // toast.showToast('Processing image...', 'info');
      const nanoBananaResult = await api.nanoBanana.createTask({
        prompt: finalPrompt,
        image_urls: [uploadedImageUrl],
        output_format: 'png',
        image_size: 'auto',
      });

      if (nanoBananaResult.code !== 200 || !nanoBananaResult.data?.task_id) {
        throw new Error(nanoBananaResult.msg || 'Failed to create Nano Banana task');
      }

      const nanoBananaTaskId = nanoBananaResult.data.task_id;

      // 步骤3: 轮询 Nano Banana 任务状态
      // toast.showToast('Waiting for image processing...', 'info');
      const processedImageUrl = await pollNanoBananaTask(nanoBananaTaskId);
      console.log('Processed image URL received:', processedImageUrl);

      // 步骤4: 从 URL 下载处理后的图片并转为 File
      console.log('Downloading processed image...');
      const processedImageFile = await urlToFile(processedImageUrl, 'processed-image.png');
      console.log('Processed image file created:', processedImageFile);

      // 步骤5: 从音乐 URL 创建 File
      const music = MUSIC_TRACKS.find((m) => m.id === selectedMusicId);
      if (!music) {
        toast.error('Please choose a music');
        stopFakeProgress();
        setPreviewState('idle');
        return;
      }
      let musicRes;
      try {
        musicRes = await fetch(music.url, { mode: 'cors' });
      } catch (error: any) {
        console.error('Failed to fetch music:', error);
        toast.error('Failed to load music: CORS error. Please check network connection.');
        stopFakeProgress();
        setPreviewState('idle');
        return;
      }
      if (!musicRes.ok) {
        toast.error(`Failed to load music: ${musicRes.status} ${musicRes.statusText}`);
        stopFakeProgress();
        setPreviewState('idle');
        return;
      }
      const musicBlob = await musicRes.blob();
      const audioFile = new File([musicBlob], `${music.id}.mp3`, {
        type: musicBlob.type || 'audio/mpeg',
      });

      // 获取音频时长
      const duration = await new Promise<number>((resolve) => {
        try {
          const audioEl = document.createElement('audio');
          audioEl.preload = 'metadata';
          audioEl.onloadedmetadata = () => {
            const d = Math.ceil(audioEl.duration || 0);
            URL.revokeObjectURL(audioEl.src);
            resolve(d || 30);
          };
          audioEl.onerror = () => {
            URL.revokeObjectURL(audioEl.src);
            resolve(30);
          };
          audioEl.src = URL.createObjectURL(audioFile);
        } catch {
          resolve(30);
        }
      });
      setAudioDuration(duration);

      // 积分检查
      const resolution: Resolution = '720p';
      const requiredCredits = calculateCredits(duration, resolution);
      if (userInfo.total_credits < requiredCredits) {
        setIsInsufficientCreditsModalOpen(true);
        stopFakeProgress();
        setPreviewState('idle');
        setIsGenerating(false);
        return;
      }

      // 步骤6: 调用 InfiniteTalk image-to-video 接口
      // toast.showToast('Generating video...', 'info');
      const createResult = await api.infiniteTalk.createTask({
        image: processedImageFile,
        audio: audioFile,
        prompt: '', // prompt 为空
        duration: Math.ceil(duration),
        resolution,
      });

      if (createResult.code !== 200 || !createResult.data?.task_id) {
        const msg = createResult.msg || 'Failed to create task';
        throw new Error(msg);
      }

      const taskId = createResult.data.task_id;

      const result = await api.infiniteTalk.pollTaskStatus(taskId, () => {}, undefined);

      stopFakeProgress();
      setProgress(100);

      setTimeout(() => {
        setResultVideoUrl(result.image_url);
        setResultTaskId(taskId);
        setPreviewState('result');
        toast.success('Video generated successfully!');
      }, 600);
    } catch (error: any) {
      console.error('Generation failed:', error);
      if (error?.message && error.message !== 'Insufficient credits') {
        toast.error(error.message);
      }
      stopFakeProgress();
      setPreviewState('idle');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderBackground = () => (
    <div 
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: 'url(https://www.infinitetalk2.com/infinitetalk/bg03.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  );

  const renderDisplay = () => (
      <div className="relative h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden font-mountains">
      {renderBackground()}
      {/* 整个组件的下雪效果 */}
      <SnowOverlay density={120} />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center flex-1 mb-10">
        <h1 className="text-5xl md:text-6xl text-center mb-6 font-bold tracking-wide" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
          <span className="text-yellow-300">Christmas</span>{' '}
          <span className="text-white">Greeting Video Ideas</span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 text-center max-w-2xl mx-auto mb-12 leading-relaxed" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
          Upload your photo, and let Santa do the magic! A free, personalized video is just one click away
        </p>

        <Button
          variant="outline"
          onClick={() => setViewState('create')}
          className="bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white border-2 border-white rounded-2xl px-8 py-6 text-lg font-semibold mb-12 transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          Create the same video
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </Button>

        <div className="flex items-center justify-center gap-1 md:gap-1 lg:gap-2 w-full max-w-4xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl mt-15">
          {/* 左竖版 - 3:4 比例 */}
          <div className="relative overflow-hidden bg-slate-900/60 border border-white/15 shadow-2xl h-[240px] md:h-[300px] lg:h-[350px] xl:h-[380px] aspect-[3/4] flex-shrink-0 -mt-[5%] md:-mt-[10%] lg:-mt-[15%] xl:-mt-[20%]">
            <video
              src={sampleVideos[0].src}
              poster={sampleVideos[0].videoPoster}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isDisplayVideo1Muted}
              playsInline
            />
            <button
              onClick={() => setIsDisplayVideo1Muted(!isDisplayVideo1Muted)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              title={isDisplayVideo1Muted ? 'Unmute' : 'Mute'}
            >
              {isDisplayVideo1Muted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* 中间横版 */}
          <div className="relative overflow-hidden bg-slate-900/60 border border-white/15 shadow-2xl h-[200px] md:h-[280px] lg:h-[320px] xl:h-[360px] w-[320px] md:w-[560px] lg:w-[640px] xl:w-[720px] flex-shrink-0 mx-1 md:mx-4 lg:mx-6 xl:mx-8">
            <video
              src={sampleVideos[1].src}
              poster={sampleVideos[1].videoPoster}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isDisplayVideo2Muted}
              playsInline
            />
            <button
              onClick={() => setIsDisplayVideo2Muted(!isDisplayVideo2Muted)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              title={isDisplayVideo2Muted ? 'Unmute' : 'Mute'}
            >
              {isDisplayVideo2Muted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* 右竖版 - 9:16 比例 */}
          <div className="relative overflow-hidden bg-slate-900/60 border border-white/15 shadow-2xl h-[320px] md:h-[400px] lg:h-[450px] xl:h-[500px] aspect-[9/16] flex-shrink-0 -mt-[5%] md:-mt-[10%] lg:-mt-[15%] xl:-mt-[20%]">
            <video
              src={sampleVideos[2].src}
              poster={sampleVideos[2].videoPoster}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted={isDisplayVideo3Muted}
              playsInline
            />
            <button
              onClick={() => setIsDisplayVideo3Muted(!isDisplayVideo3Muted)}
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              title={isDisplayVideo3Muted ? 'Unmute' : 'Mute'}
            >
              {isDisplayVideo3Muted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCreate = () => {
    const isPortrait = imageOrientation === 'portrait';

    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center py-20 font-mountains">
        {renderBackground()}
        {/* 整个组件的下雪效果 */}
        <SnowOverlay density={120} />

        <div className="relative z-25 w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center flex-1">
          <h1 className="text-5xl md:text-6xl text-center mb-4 font-bold tracking-wide" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
            <span className="text-yellow-300">Christmas</span>{' '}
            <span className="text-white">Greeting Video Ideas</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 text-center max-w-2xl mx-auto mb-20 leading-relaxed" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
            Upload your photo, and let Santa do the magic! A free, personalized video is just one click away
          </p>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 lg:gap-16 w-full max-w-7xl items-center justify-center">
            {/* 左侧：工具区 */}
            <div className="space-y-4 w-full md:w-[45%] md:flex-shrink-0">
              {/* 上传图片 + 提示词 + 模板选择 */}
              <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-yellow-400/30 shadow-[0_18px_60px_rgba(0,0,0,0.5)] p-6 space-y-6">
                {/* 上传图片 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 font-mountains">Upload photo</h3>
                  <div className="relative">
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="h-32 rounded-2xl border-2 border-dashed border-yellow-400/30 bg-black/5 flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400/50 transition-colors relative overflow-hidden"
                    >
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-contain rounded-2xl"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-600 flex items-center justify-center transition-colors z-10"
                            title="Remove image"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 rounded-full border border-yellow-400/40 flex items-center justify-center mb-3">
                            <Upload className="w-7 h-7 text-white/80" />
                          </div>
                          <p className="text-white/80 text-sm" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>Drag & Drop photo here to upload</p>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* 提示词输入 */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 font-mountains">Prompt</h3>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe what you want the character to express or do..."
                    className="w-full h-24 bg-black/20 border-yellow-400/30 text-white placeholder-white/50 resize-none focus:border-yellow-400/60"
                    style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 font-mountains">Template Selection</h3>
                  <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar scroll-smooth">
                    {TEMPLATES.map((tpl) => (
                      <HoverCard key={tpl.id} openDelay={0} closeDelay={100}>
                        <HoverCardTrigger asChild>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplateId(tpl.id);
                              setPrompt(tpl.prompt);
                            }}
                            className={`relative rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${
                              selectedTemplateId === tpl.id
                                ? 'border-yellow-400 shadow-lg'
                                : 'border-yellow-400/30 hover:border-yellow-400/60'
                            }`}
                            style={{ aspectRatio: '2/1', width: '180px' }}
                          >
                            <img
                              src={tpl.thumbnail}
                              alt={tpl.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-white text-xs font-medium py-1.5 px-2 text-center" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                              {tpl.name}
                            </div>
                          </button>
                        </HoverCardTrigger>
                        {tpl.previewVideo && (
                          <HoverCardContent side="top" className="w-auto p-2 bg-black/90 border-yellow-400/30">
                            <div className="w-[400px] aspect-video rounded-lg overflow-hidden">
                              <video
                                src={tpl.previewVideo}
                                poster={tpl.videoPoster}
                                className="w-full h-full object-cover"
                                autoPlay
                                loop
                                muted
                                playsInline
                              />
                            </div>
                          </HoverCardContent>
                        )}
                      </HoverCard>
                    ))}
                  </div>
                </div>
              </div>

              {/* 音乐 + 生成按钮 */}
              <div className="bg-black/40 backdrop-blur-md rounded-3xl border border-yellow-400/30 shadow-[0_18px_60px_rgba(0,0,0,0.5)] p-6 space-y-6">

                {/* Choose music */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white font-mountains">Choose music</h3>
                    <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 border border-yellow-400/30">
                      <button
                        type="button"
                        onClick={() => setGenderFilter('all')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          genderFilter === 'all'
                            ? 'bg-yellow-400/20 text-white border border-yellow-400/50'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                        style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenderFilter('male')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          genderFilter === 'male'
                            ? 'bg-yellow-400/20 text-white border border-yellow-400/50'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                        style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                      >
                        Male
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenderFilter('female')}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          genderFilter === 'female'
                            ? 'bg-yellow-400/20 text-white border border-yellow-400/50'
                            : 'text-white/60 hover:text-white/80'
                        }`}
                        style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                      >
                        Female
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-3 custom-scrollbar scroll-smooth">
                    {MUSIC_TRACKS.filter((track) => {
                      if (genderFilter === 'all') return true;
                      return track.taglist?.includes(genderFilter);
                    }).map((track) => {
                      const isActive = selectedMusicId === track.id;
                      const isPlaying = isActive && isMusicPlaying;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => handleSelectMusic(track.id)}
                          className={`py-3 px-4 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 whitespace-nowrap ${
                            isActive
                              ? 'border-yellow-400 bg-yellow-400/20 text-white shadow-lg'
                              : 'border-yellow-400/30 bg-black/10 text-white/80 hover:border-yellow-400/60'
                          }`}
                          title={track.name}
                        >
                          <Music2
                            className={`w-4 h-4 mr-1 ${isPlaying ? 'animate-pulse text-yellow-300' : ''}`}
                          />
                          <span className="text-xs" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>{track.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 生成按钮 */}
                <div className="pt-2 relative">
                  <Button
                    variant="outline"
                    disabled={!imageFile || !selectedMusicId || !prompt || !prompt.trim()}
                    onClick={handleGenerateClick}
                    className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white rounded-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Create the video
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                  </Button>
                  {/* 积分显示 */}
                  {selectedMusicId && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                      {audioDuration > 0 
                        ? `${calculateCredits(audioDuration, '720p')} Credits`
                        : '11 Credits'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：预览区 */}
            <div className="flex flex-col items-center justify-start gap-4 ">
              {isPortrait ? (
                // 手机容器
                <div className="relative w-[420px] h-[840px] rounded-[46px] bg-black/80 border-[6px] border-slate-200 shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
                  {/* 顶部听筒 */}
                  <div className="z-100 absolute top-3 left-1/2 -translate-x-1/2 w-30 h-8 rounded-full bg-black/80 flex items-center justify-center">
                    <div className="w-14 h-1.5 rounded-full bg-slate-800" />
                  </div>
                  {/* 屏幕 */}
                  <div className="absolute inset-[5px] rounded-[34px] overflow-hidden bg-black">
                    {previewState === 'loading' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80">
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative flex flex-col items-center">
                            <div className="absolute -top-4 flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.9)]" />
                              <div className="absolute w-4 h-4 rounded-full border border-yellow-100 animate-ping" />
                            </div>
                            <div className="w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-b-[40px] border-b-emerald-500 animate-pulse" />
                            <div className="w-0 h-0 -mt-4 border-l-[32px] border-l-transparent border-r-[32px] border-r-transparent border-b-[46px] border-b-emerald-600 animate-pulse delay-150" />
                            <div className="w-0 h-0 -mt-4 border-l-[38px] border-l-transparent border-r-[38px] border-r-transparent border-b-[52px] border-b-emerald-700 animate-pulse delay-300" />
                            <div className="w-4 h-5 bg-amber-800 mt-1 rounded-sm" />
                          </div>
                          <p className="text-xs text-white/80 mt-3" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                            Santa is preparing your Christmas video...
                          </p>
                        </div>
                        <Progress value={progress} className="w-32" />
                        <p className="text-white text-xs mt-2">{Math.round(progress)}% complete</p>
                      </div>
                    ) : (
                      <>
                        <video
                          src={previewState === 'result' && resultVideoUrl ? resultVideoUrl : sampleVideos[2].src}
                          poster={sampleVideos[0].videoPoster}
                          className="w-full h-full object-cover"
                          controls={previewState === 'result' && resultVideoUrl ? true : false}
                          autoPlay
                          loop
                          muted={previewState !== 'result' ? isPreviewMuted : false}
                          playsInline
                        />
                        {previewState !== 'result' && (
                          <button
                            onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                            title={isPreviewMuted ? 'Unmute' : 'Mute'}
                          >
                            {isPreviewMuted ? (
                              <VolumeX className="w-4 h-4 text-white" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-white" />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : (
                // 电脑容器
                <div 
                  className="w-[720px] h-[480px] rounded-lg overflow-hidden relative box-content"
                  style={{
                    backgroundImage: 'url(https://cfsource.infinitetalk.net/infinitetalk/christmas/pc-wrapper.png)',
                    backgroundSize: 'contain',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* 视频内容区域 - 需要根据实际图片调整 padding */}
                  <div className="absolute inset-0 pt-5 pl-20 pr-20 pb-30 z-10">
                    {previewState === 'loading' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/80 rounded-lg">
                        <div className="flex flex-col items-center mb-6">
                          <div className="relative flex flex-col items-center">
                            <div className="absolute -top-4 flex items-center justify-center">
                              <div className="w-4 h-4 rounded-full bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.9)]" />
                              <div className="absolute w-4 h-4 rounded-full border border-yellow-100 animate-ping" />
                            </div>
                            <div className="w-0 h-0 border-l-[30px] border-l-transparent border-r-[30px] border-r-transparent border-b-[46px] border-b-emerald-500 animate-pulse" />
                            <div className="w-0 h-0 -mt-4 border-l-[38px] border-l-transparent border-r-[38px] border-r-transparent border-b-[54px] border-b-emerald-600 animate-pulse delay-150" />
                            <div className="w-0 h-0 -mt-4 border-l-[46px] border-l-transparent border-r-[46px] border-r-transparent border-b-[62px] border-b-emerald-700 animate-pulse delay-300" />
                            <div className="w-5 h-6 bg-amber-800 mt-1 rounded-sm" />
                          </div>
                          <p className="text-xs text-white/80 mt-3" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                            Santa is preparing your Christmas video...
                          </p>
                        </div>
                        <Progress value={progress} className="w-40" />
                        <p className="text-white text-xs mt-2">{Math.round(progress)}% complete</p>
                      </div>
                    ) : (
                      <>
                        <video
                          src={previewState === 'result' && resultVideoUrl ? resultVideoUrl : sampleVideos[1].src}
                          poster={sampleVideos[1].videoPoster}
                          className="w-full h-full object-cover rounded-lg bg-red/80"
                          autoPlay
                          controls={previewState === 'result' && resultVideoUrl ? true : false}
                          loop
                          muted={previewState !== 'result' ? isPreviewMuted : false}
                          playsInline
                        />
                        {previewState !== 'result' && (
                          <button
                            onClick={() => setIsPreviewMuted(!isPreviewMuted)}
                            className="absolute top-8 right-25 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                            title={isPreviewMuted ? 'Unmute' : 'Mute'}
                          >
                            {isPreviewMuted ? (
                              <VolumeX className="w-4 h-4 text-white" />
                            ) : (
                              <Volume2 className="w-4 h-4 text-white" />
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div> 
              )}

              {/* 结果分享区 */}
              {previewState === 'result' && resultVideoUrl && selectedTemplateId && selectedMusicId && (
                <div className="flex items-center gap-3" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isDownloading}
                    className="flex items-center gap-2 border-2 border-yellow-400/50 bg-gradient-to-r from-red-600/30 to-red-700/30 text-yellow-300 hover:from-red-600/50 hover:to-red-700/50 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-3 px-4 rounded-lg shadow-lg"
                    onClick={handleDownload}
                    style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 text-yellow-300" />
                        <span>Download</span>
                      </>
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-2 border-yellow-400/50 bg-blue-500/20 text-white hover:bg-[#1DA1F2] hover:border-yellow-400 w-10 h-10 rounded-lg shadow-lg"
                    onClick={() => shareChristmasToSocial(resultVideoUrl, selectedTemplateId, selectedMusicId, 'twitter')}
                    title="Share to Twitter"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-2 border-yellow-400/50 bg-blue-600/20 text-white hover:bg-[#1877F2] hover:border-yellow-400 w-10 h-10 rounded-lg shadow-lg"
                    onClick={() => shareChristmasToSocial(resultVideoUrl, selectedTemplateId, selectedMusicId, 'facebook')}
                    title="Share to Facebook"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-2 border-yellow-400/50 bg-green-600/20 text-white hover:bg-[#25D366] hover:border-yellow-400 w-10 h-10 rounded-lg shadow-lg"
                    onClick={() => shareChristmasToSocial(resultVideoUrl, selectedTemplateId, selectedMusicId, 'whatsapp')}
                    title="Share to WhatsApp"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );

  };

  return (
    <>
      {viewState === 'display' ? renderDisplay() : renderCreate()}

      {/* 积分不足弹窗 */}
      <Dialog open={isInsufficientCreditsModalOpen} onOpenChange={setIsInsufficientCreditsModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Insufficient Credits</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6 space-y-4">
            <p className="text-slate-300">
              You need at least {calculateCredits(audioDuration, '480p')} credits to generate this video.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setIsInsufficientCreditsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsInsufficientCreditsModalOpen(false);
                  window.open('/pricing', '_blank');
                }}
              >
                Buy Credits
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
}
