'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast-provider';
import { useUser } from '@clerk/nextjs';
import { useUserInfo, useTrialAccess } from '@/lib/providers';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { api } from '@/lib/api';
import { shareChristmasToSocial } from './share-utils';
import Link from 'next/link';
import { Upload, Music2, Download, X, Loader2, Sparkles, Volume2, VolumeX, Play, Pause, Plus } from 'lucide-react';

type ImageOrientation = 'portrait' | 'landscape' | null;
type Resolution = '480p' | '720p' | '1080p';
type ViewState = 'display' | 'loading' | 'result';

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

// 下载媒体文件的函数
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

const TEMPLATES = [
  {
    id: 't1',
    name: 'Cozy Home',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/1.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t1-m.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t1-m.png',
    prompt:
      '  In the suburbs of Christmas, snow falls on Christmas trees, and the roofs and windowsills of small wooden houses are covered with a thick layer of white snow. There is a flower wreath made of pine cones and red berries hanging at the door. The character is wearing a Christmas sweater, wearing a red Christmas hat, holding a Christmas card, and standing next to a small wooden house. The character width accounts for 70% of the page. The proportion of height on the page is about 70%, making people instantly feel the lively, excited, and energetic atmosphere of the festival night.',
  },
  {
    id: 't2',
    name: 'Living Room',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/2.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t2-m.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t2-m.png',
    prompt:
      '  In the center of the living room, there is a super large and lush real pine tree! It is covered with various retro glass ball ornaments, with warm yellow white string lights on. Snow is drifting outside the window, the feeling of night. The overall atmosphere inside the house is warm, with a soft yellow color tone. The character stands at the front, holding a Christmas card, and the width of the character accounts for 70% of the page. About 70% of the page is high, wearing an ugly Christmas sweater printed on it',
  },
  {
    id: 't3',
    name: 'Church Interior',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/3.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t3-m.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t3-m.png',
    prompt:
      '  The interior of the Christmas church is decorated with a large number of green holly branches and red potted poinsettias in the night background. The main lighting comes from chandeliers and lit candles. The character is in the center of the video, wearing a red Christmas hat, and the width of the character accounts for 70% of the page. The height accounts for about 70% of the page, wearing an ugly Christmas sweater, making people instantly feel the lively, excited, and energetic atmosphere of the holiday night.',
  },
  {
    id: 't4',
    name: 'Pine Forest',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/4.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/t4-m.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/t4-m.png',
    prompt:
      '  A pine forest in the outskirts, covered in snow on the ground, with yellow lights shining from the windows of the small wooden houses on the farm, warm and romantic. Most importantly, countless warm light strings, only white or amber, are wrapped around the pine trees in the forest, outlining their contours. As dusk falls and the lights begin to dominate the view, the entire scene becomes poetic and romantic. The character is wearing a Christmas sweater and a red Christmas hat, with a width of 70% of the page. The proportion of height on the page is about 70%, making people instantly feel the lively, excited, and energetic atmosphere of the festival night.',
  },
  {
    id: 't5',
    name: 'Merry Christmas',
    thumbnail: 'https://www.infinitetalk2.com/infinitetalk/5.png',
    previewVideo: 'https://www.infinitetalk2.com/infinitetalk/5_pc.mp4',
    videoPoster: 'https://www.infinitetalk2.com/infinitetalk/5_pc.png',
    previewVideomobile: 'https://www.infinitetalk2.com/infinitetalk/5-m.mp4',
    videoPostermobile: 'https://www.infinitetalk2.com/infinitetalk/5-m.png',
    prompt:
      'The background is a simple texture of Christmas red, with a large white artistic font "Merry Christmas" designed on top of it, which accounts for 80% of the width of the page. The artistic font is divided into two lines, one line displays "Merry" and the other line displays "Christmas", with the same font style. There is a real-life Christmas tree with gifts and colorful lights hanging on it. The background space is decorated with fewer Christmas elements, and the layout is coordinated. The overall style is simple and atmospheric, with the character standing at the front wearing a green Christmas sweater. The character width accounts for 70% of the page. The proportion of height on the page is about 80%, making people instantly feel the color impact and vibrant atmosphere of the festival.',
  }

];

const MUSIC_TRACKS = [
  { id: 'm9', name: 'Fairytale At Christmas', url: '/music/3.mp3', taglist: [] },
  { id: 'm7', name: 'All I Want For Christmas', url: '/music/1.mp3', taglist: [] },
  { id: 'm8', name: 'Feliz Navidad', url: '/music/2.mp3', taglist: [] },
  { id: 'm10', name: 'Santa Tell Me', url: '/music/Santa Tell Me.MP3', taglist: [] },
  { id: 'm11', name: 'Last Christmas', url: '/music/Last Christmas.MP3', taglist: [] },
  { id: 'm12', name: 'Snowman', url: '/music/Snowman.MP3', taglist: [] },
  { id: 'm13', name: 'Mistletoe', url: '/music/Mistletoe.MP3', taglist: [] },
  { id: 'm1', name: 'Female Family', url: '/music/fmale_fam.mp3', taglist: ['female'] },
  { id: 'm2', name: 'Female Friend', url: '/music/fmale_fir.mp3', taglist: ['female'] },
  { id: 'm3', name: 'Female Colleague', url: '/music/fmale_work.mp3', taglist: ['female'] },
  { id: 'm4', name: 'Male Family', url: '/music/male_fam.mp3', taglist: ['male'] },
  { id: 'm5', name: 'Male Friend', url: '/music/male_fri.mp3', taglist: ['male'] },
  { id: 'm6', name: 'Male Colleague', url: '/music/male_work.mp3', taglist: ['male'] },
];

export function ChristmasHeroMobile() {
  const searchParams = useSearchParams();
  const [viewState, setViewState] = useState<ViewState>('display');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isSignedIn } = useUser();
  const { openAuthModal } = useAuthModal();
  const toast = useToast();
  const { userInfo } = useUserInfo();

  // 表单状态
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

  // 自定义音频上传
  const customAudioInputRef = useRef<HTMLInputElement>(null);
  const [customAudioFile, setCustomAudioFile] = useState<File | null>(null);
  const [customAudioDuration, setCustomAudioDuration] = useState<number>(0);

  const [audioDuration, setAudioDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null);
  const [resultTaskId, setResultTaskId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] = useState(false);
  const [isUpgradeModeModalOpen, setIsUpgradeModeModalOpen] = useState(false);
  const progressTimerRef = useRef<number | null>(null);

  // 背景视频静音状态，默认静音
  const [isBackgroundVideoMuted, setIsBackgroundVideoMuted] = useState(true);

  // 模板预览视频状态
  const [templatePreviewVideo, setTemplatePreviewVideo] = useState<string | null>(null);

  // 结果视频播放状态
  const resultVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isResultVideoPlaying, setIsResultVideoPlaying] = useState(false);
  const [isResultVideoMuted, setIsResultVideoMuted] = useState(false);
  const [resultVideoProgress, setResultVideoProgress] = useState(0);
  const [resultVideoDuration, setResultVideoDuration] = useState(0);
  const [resultVideoCurrentTime, setResultVideoCurrentTime] = useState(0);
  const [showPlayPauseButton, setShowPlayPauseButton] = useState(false);
  const playPauseTimeoutRef = useRef<number | null>(null);

  // 试用/升级按钮判定（与 InfiniteTalkGenerator 规则对齐：720p + 音频 <= 15s 可用券）
  const effectiveDuration =
    (selectedMusicId === 'custom' ? customAudioDuration : audioDuration) || 0;

  const trialAccess = useTrialAccess('infinitetalk', {
    resolution: '720p',
    duration: effectiveDuration > 0 ? Math.ceil(effectiveDuration) : 0,
  });

  const hasVouchers = (userInfo?.free_times ?? 0) > 0;
  const hasNoCredits = (userInfo?.total_credits ?? 0) === 0;
  const hasAudio = effectiveDuration > 0;
  const isAudioTooLong = hasAudio && Math.ceil(effectiveDuration) > 15;
  const userLevel = userInfo?.level ?? 0;

  const isUpgradeMode =
    isSignedIn &&
    hasVouchers &&
    hasAudio &&
    isAudioTooLong &&
    userLevel === 0;

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
      setViewState('result');
    }
  }, [searchParams]);

  // 当筛选改变时，如果当前选中的音乐不在筛选结果中，自动选择第一个可用的音乐
  useEffect(() => {
    // 自定义音频（custom）不参与预设音乐筛选，直接返回，避免被重置
    if (selectedMusicId === 'custom') return;

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
      if (playPauseTimeoutRef.current) {
        clearTimeout(playPauseTimeoutRef.current);
      }
    };
  }, []);

  // Drawer 关闭时，停止音乐播放，避免与背景视频或结果视频重叠
  useEffect(() => {
    if (!isDrawerOpen && musicAudioRef.current) {
      musicAudioRef.current.pause();
      musicAudioRef.current.currentTime = 0;
      setIsMusicPlaying(false);
      setCurrentMusicId(null);
    }
  }, [isDrawerOpen]);

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

  // 音频验证函数（从 InfiniteTalkGenerator 复制）
  const validateAudioFile = async (file: File): Promise<{ isValid: boolean; duration?: number; error?: string }> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new AudioContext();

      try {
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const duration = audioBuffer.duration;
        await audioContext.close();

        return {
          isValid: true,
          duration: Math.ceil(duration)
        };
      } catch (decodeError) {
        await audioContext.close();
        return {
          isValid: false,
          error: 'Audio file is corrupted'
        };
      }
    } catch (readError) {
      return {
        isValid: false,
        error: 'Failed to read file'
      };
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
    // 清除模板预览视频，恢复默认背景视频
    setTemplatePreviewVideo(null);

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

  // 处理自定义音频上传
  const handleCustomAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 登录检查
    if (!isSignedIn) {
      requestAnimationFrame(() => openAuthModal('signin'));
      // 清空文件输入
      if (event.target) {
        event.target.value = '';
      }
      return;
    }

    // 检查音频格式
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

    if (!hasValidExtension) {
      toast.error('Invalid audio format. Please upload mp3, wav, m4a, ogg, or flac files.');
      return;
    }

    // 验证音频文件
    const validation = await validateAudioFile(file);

    if (!validation.isValid) {
      toast.error(validation.error || 'Audio file is corrupted or invalid');
      return;
    }

    // 设置自定义音频
    setCustomAudioFile(file);
    if (validation.duration) {
      setCustomAudioDuration(validation.duration);
    }

    // 自动选中自定义音频（不自动播放）
    setSelectedMusicId('custom');

    // 停止当前正在播放的预设音乐
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      setIsMusicPlaying(false);
      setCurrentMusicId(null);
    }
  };

  // 删除自定义音频
  const handleRemoveCustomAudio = () => {
    setCustomAudioFile(null);
    setCustomAudioDuration(0);
    if (customAudioInputRef.current) {
      customAudioInputRef.current.value = '';
    }

    // 如果当前选中的是自定义音频，切换到默认音乐
    if (selectedMusicId === 'custom') {
      setSelectedMusicId(MUSIC_TRACKS[0].id);
    }
  };

  const handleSelectMusic = (id: string) => {
    setSelectedMusicId(id);

    // 如果选择的是自定义音频，播放自定义音频预览
    if (id === 'custom' && customAudioFile) {
      if (!musicAudioRef.current) {
        musicAudioRef.current = new Audio();
        musicAudioRef.current.crossOrigin = 'anonymous';
      }

      if (currentMusicId === id && isMusicPlaying) {
        musicAudioRef.current.pause();
        setIsMusicPlaying(false);
        return;
      }

      musicAudioRef.current.crossOrigin = 'anonymous';
      musicAudioRef.current.src = URL.createObjectURL(customAudioFile);
      musicAudioRef.current
        .play()
        .then(() => {
          setCurrentMusicId(id);
          setIsMusicPlaying(true);
          // 播放音频时自动将背景视频静音，避免音视频声音重叠
          setIsBackgroundVideoMuted(true);
        })
        .catch(() => {
          setIsMusicPlaying(false);
        });
      return;
    }

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
      setAudioDuration(30);
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
        // 播放音频时自动将背景视频静音，避免音视频声音重叠
        setIsBackgroundVideoMuted(true);
      })
      .catch(() => {
        setIsMusicPlaying(false);
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

    // 已登录但完全没有积分也没有优惠券：直接弹积分不足（与 InfiniteTalk 主页面对齐）
    const totalCreditsInitial = userInfo.total_credits ?? 0;
    const freeTimesInitial = userInfo.free_times ?? 0;
    if (totalCreditsInitial === 0 && freeTimesInitial === 0) {
      setIsInsufficientCreditsModalOpen(true);
      return;
    }

    // 先获取音频时长，用于积分校验（在开始图片处理之前）
    let duration: number;
    if (selectedMusicId === 'custom' && customAudioFile) {
      // 使用自定义音频的时长
      duration = customAudioDuration;
    } else {
      // 从预设音乐获取时长（只获取 metadata，不下载完整文件）
      const music = MUSIC_TRACKS.find((m) => m.id === selectedMusicId);
      if (!music) {
        toast.error('Please choose a music');
        return;
      }
      try {
        duration = await new Promise<number>((resolve, reject) => {
          const audioEl = new Audio();
          audioEl.crossOrigin = 'anonymous';
          audioEl.preload = 'metadata';
          audioEl.onloadedmetadata = () => {
            const d = Math.ceil(audioEl.duration || 0);
            URL.revokeObjectURL(audioEl.src);
            resolve(d || 30);
          };
          audioEl.onerror = () => {
            URL.revokeObjectURL(audioEl.src);
            reject(new Error('Failed to load audio metadata'));
          };
          audioEl.src = music.url;
        });
      } catch (error: any) {
        console.error('Failed to get audio duration:', error);
        toast.error('Failed to load music metadata. Please check network connection.');
        return;
      }
    }

    setAudioDuration(duration);

    // 积分 / 优惠券检查（在开始图片处理之前进行）
    const resolution: Resolution = '720p';
    const requiredCredits = calculateCredits(duration, resolution);
    const totalCredits = userInfo.total_credits ?? 0;
    const freeTimes = userInfo.free_times ?? 0;
    const roundedDuration = Math.ceil(duration || 0);
    const isTrialResolution = true; // resolution 固定为 '720p'，直接视为试用分辨率
    const isTrialDuration = roundedDuration > 0 && roundedDuration <= 15;

    const canUseVoucher =
      freeTimes > 0 &&
      totalCredits === 0 &&
      isTrialResolution &&
      isTrialDuration;

    if (!canUseVoucher && totalCredits < requiredCredits) {
      setIsInsufficientCreditsModalOpen(true);
      return;
    }

    // 关闭 Drawer
    setIsDrawerOpen(false);

    // 停止音乐播放（loading 状态下音频要静音）
    if (musicAudioRef.current) {
      musicAudioRef.current.pause();
      setIsMusicPlaying(false);
      setCurrentMusicId(null);
    }

    // 积分校验通过，开始生成流程
    try {
      setIsGenerating(true);
      setViewState('loading');
      setResultVideoUrl(null);
      setResultTaskId(null);
      setTaskCreated(false);
      startFakeProgress();

      // 使用用户输入的 prompt
      const finalPrompt = prompt.trim();

      // 获取音频文件
      let audioFile: File;

      if (selectedMusicId === 'custom' && customAudioFile) {
        // 使用自定义音频
        audioFile = customAudioFile;
      } else {
        // 从音乐 URL 创建 File
        const music = MUSIC_TRACKS.find((m) => m.id === selectedMusicId);
        if (!music) {
          toast.error('Please choose a music');
          stopFakeProgress();
          setViewState('display');
          return;
        }
        let musicRes;
        try {
          musicRes = await fetch(music.url, { mode: 'cors' });
        } catch (error: any) {
          console.error('Failed to fetch music:', error);
          toast.error('Failed to load music: CORS error. Please check network connection.');
          stopFakeProgress();
          setViewState('display');
          return;
        }
        if (!musicRes.ok) {
          toast.error(`Failed to load music: ${musicRes.status} ${musicRes.statusText}`);
          stopFakeProgress();
          setViewState('display');
          return;
        }
        const musicBlob = await musicRes.blob();
        audioFile = new File([musicBlob], `${music.id}.mp3`, {
          type: musicBlob.type || 'audio/mpeg',
        });
      }

      // 调用 Christmas 专属接口（合并图片处理和视频生成）
      const createResult = await api.infiniteTalk.createChristmasTask({
        image: imageFile,
        audio: audioFile,
        duration: Math.ceil(duration),
        resolution: '720p',
        image_prompt: finalPrompt,
        output_format: 'png',
        image_size: 'auto',
      });

      if (createResult.code !== 200 || !createResult.data?.task_id) {
        const msg = createResult.msg || 'Failed to create task';
        throw new Error(msg);
      }

      const taskId = createResult.data.task_id;
      setTaskCreated(true);

      const result = await api.infiniteTalk.pollTaskStatus(taskId, () => { }, undefined);

      stopFakeProgress();
      setProgress(100);

      setTimeout(() => {
        setResultVideoUrl(result.image_url);
        setResultTaskId(taskId);
        setViewState('result');
        toast.success('Video generated successfully!');
      }, 600);
    } catch (error: any) {
      console.error('Generation failed:', error);
      if (error?.message && error.message !== 'Insufficient credits') {
        toast.error(error.message);
      }
      stopFakeProgress();
      setViewState('display');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBackToDisplay = () => {
    setViewState('display');
    setResultVideoUrl(null);
    setResultTaskId(null);
    setProgress(0);
    // 重置视频状态
    if (resultVideoRef.current) {
      resultVideoRef.current.pause();
      resultVideoRef.current.currentTime = 0;
    }
    setIsResultVideoPlaying(false);
    setResultVideoProgress(0);
    setResultVideoCurrentTime(0);
    setShowPlayPauseButton(false);
    if (playPauseTimeoutRef.current) {
      clearTimeout(playPauseTimeoutRef.current);
      playPauseTimeoutRef.current = null;
    }
  };

  // 处理结果视频播放/暂停
  const handleResultVideoToggle = () => {
    if (!resultVideoRef.current) return;
    if (isResultVideoPlaying) {
      resultVideoRef.current.pause();
      setIsResultVideoPlaying(false);
      setShowPlayPauseButton(false);
    } else {
      resultVideoRef.current.play();
      setIsResultVideoPlaying(true);
      // 显示暂停按钮，1秒后隐藏
      setShowPlayPauseButton(true);
      if (playPauseTimeoutRef.current) {
        clearTimeout(playPauseTimeoutRef.current);
      }
      playPauseTimeoutRef.current = window.setTimeout(() => {
        setShowPlayPauseButton(false);
      }, 1000);
    }
  };

  // 处理结果视频静音切换
  const handleResultVideoMuteToggle = () => {
    if (!resultVideoRef.current) return;
    resultVideoRef.current.muted = !isResultVideoMuted;
    setIsResultVideoMuted(!isResultVideoMuted);
  };

  // 处理结果视频进度条点击
  const handleResultVideoProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!resultVideoRef.current || !resultVideoDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * resultVideoDuration;
    resultVideoRef.current.currentTime = newTime;
    setResultVideoCurrentTime(newTime);
    setResultVideoProgress(percentage * 100);
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCustomizeClick = () => {
    // 登录检查
    if (!isSignedIn) {
      requestAnimationFrame(() => openAuthModal('signin'));
      return;
    }
    setIsDrawerOpen(true);
  };

  return (
    <>
      {/* Display State - 背景视频 + 底部按钮 */}
      {(viewState === 'display' || viewState === 'loading') && (
        <div className="relative w-full h-[calc(100dvh-4rem)] overflow-hidden flex flex-col items-center justify-center">
          {/* 背景视频 */}
          <video
            key={templatePreviewVideo || 'default'}
            src={templatePreviewVideo || "https://www.infinitetalk2.com/infinitetalk/h2.mp4"}
            poster={templatePreviewVideo
              ? TEMPLATES.find(t => t.previewVideo === templatePreviewVideo)?.videoPoster || 'https://www.infinitetalk2.com/infinitetalk/h2.webp'
              : 'https://www.infinitetalk2.com/infinitetalk/h2.webp'}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            loop
            muted={viewState === 'loading' || isBackgroundVideoMuted}
            playsInline
          />

          {/* 静音开关 */}
          {viewState === 'display' && (
            <button
              onClick={() => setIsBackgroundVideoMuted(!isBackgroundVideoMuted)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
              title={isBackgroundVideoMuted ? 'Unmute' : 'Mute'}
            >
              {isBackgroundVideoMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
          )}

          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* Loading State - 加载层 */}
          {viewState === 'loading' && (
            <div className="absolute inset-0 z-50 bg-black/70 flex flex-col items-center justify-center p-6">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
              <h3 className="text-white text-xl font-semibold mb-4" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>Generating Video...</h3>
              <div className="w-full max-w-sm">
                <Progress value={progress} className="w-full mb-2" />
                <p className="text-slate-400 text-sm text-center" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>{Math.round(progress)}% complete</p>
                {taskCreated && (
                  <div className="mt-4 p-3 bg-black/50 border border-white/10 rounded-lg">
                    <p className="text-xs text-slate-200 text-center leading-relaxed" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                      You don&apos;t need to wait here. Check your work in the{' '}
                      <Link href="/profile" className="text-primary underline underline-offset-2 hover:text-primary/80">
                        Profile Center
                      </Link>{' '}
                      after 5 minutes.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 标题和副标题 */}
          {viewState === 'display' && (
            <div className="relative z-10 text-center px-6 mb-8">
              <h1 className="text-3xl md:text-4xl text-yellow-300 mb-3 font-bold tracking-wide" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                Merry Christmas ai video Marker
              </h1>
              <p className="text-sm md:text-base text-white/90 leading-relaxed" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                Create Christmas videos in minutes with AI. Just pick a template and click to generate, let InfiniteTalk AI handle the scenes, media, voiceovers, and sound effects. Instantly delivers free Christmas video clips with music.
              </p>
            </div>
          )}

          {/* 底部按钮 */}
          {viewState === 'display' && (
            <div 
              className="absolute bottom-0 left-0 right-0 px-6 pt-6 z-10"
              style={{ 
                paddingBottom: `calc(2rem + env(safe-area-inset-bottom, 0px))` 
              }}
            >
              <Button
                onClick={handleCustomizeClick}
                className="w-full bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white border-2 border-white rounded-lg py-6 text-lg font-semibold shadow-lg flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Customize
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Result State - 全屏展示视频 */}
      {viewState === 'result' && resultVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* 视频区域 - 全屏 */}
          <div className="absolute inset-0">
            <video
              ref={resultVideoRef}
              src={resultVideoUrl}
              className="w-full h-full object-contain"
              playsInline
              muted={isResultVideoMuted}
              onLoadedMetadata={() => {
                if (resultVideoRef.current) {
                  setResultVideoDuration(resultVideoRef.current.duration);
                }
              }}
              onTimeUpdate={() => {
                if (resultVideoRef.current) {
                  const current = resultVideoRef.current.currentTime;
                  const duration = resultVideoRef.current.duration;
                  setResultVideoCurrentTime(current);
                  if (duration) {
                    setResultVideoProgress((current / duration) * 100);
                  }
                }
              }}
              onPlay={() => setIsResultVideoPlaying(true)}
              onPause={() => setIsResultVideoPlaying(false)}
              onEnded={() => {
                setIsResultVideoPlaying(false);
                setResultVideoProgress(0);
                setResultVideoCurrentTime(0);
              }}
            />

            {/* 返回按钮 - 左上角，半透明玻璃背景，白色图标 */}
            <button
              onClick={handleBackToDisplay}
              className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/40 flex items-center justify-center transition-colors"
              title="Back"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 静音按钮 - 右上角，半透明玻璃背景 */}
            <button
              onClick={handleResultVideoMuteToggle}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/40 flex items-center justify-center transition-colors"
              title={isResultVideoMuted ? 'Unmute' : 'Mute'}
            >
              {isResultVideoMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>

            {/* 播放/暂停按钮 - 居中，点击播放后显示1秒后隐藏，但始终可点击，半透明玻璃背景 */}
            <button
              onClick={handleResultVideoToggle}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 hover:bg-black/10 transition-colors cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-full bg-black/30 backdrop-blur-md border border-white/10 hover:bg-black/40 flex items-center justify-center transition-all hover:scale-110 ${(!isResultVideoPlaying || showPlayPauseButton) ? 'opacity-100' : 'opacity-0'
                }`}>
                {isResultVideoPlaying ? (
                  <Pause className="w-8 h-8 text-white" fill="currentColor" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
                )}
              </div>
            </button>
          </div>

          {/* 底部按钮组 - 悬浮展示，半透明玻璃效果 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 z-30">
            {/* 进度条 - 在按钮组内部，确保不被遮挡 */}
            <div className="mb-4 px-2">
              <div
                className="w-full h-1 bg-white/30 rounded-full cursor-pointer"
                onClick={handleResultVideoProgressClick}
              >
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${resultVideoProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-white text-xs mt-1">
                <span>{formatTime(resultVideoCurrentTime)}</span>
                <span>{formatTime(resultVideoDuration)}</span>
              </div>
            </div>
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-3 justify-around">
                {selectedTemplateId && selectedMusicId && (
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      className="border-2 border-yellow-400/50 bg-black text-white hover:bg-gray-900 hover:border-yellow-400 h-14 px-4 rounded-lg shadow-lg flex items-center gap-2"
                      onClick={() =>
                        shareChristmasToSocial(
                          resultVideoUrl,
                          selectedTemplateId,
                          selectedMusicId,
                          'twitter'
                        )
                      }
                      title="Share to X"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif',
                        }}
                      >
                        Share on X
                      </span>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-2 border-yellow-400/50 bg-[#1877F2] text-white hover:bg-[#166fe5] hover:border-yellow-400 w-14 h-14 rounded-lg shadow-lg"
                      onClick={() =>
                        shareChristmasToSocial(
                          resultVideoUrl,
                          selectedTemplateId,
                          selectedMusicId,
                          'facebook'
                        )
                      }
                      title="Share to Facebook"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-2 border-yellow-400/50 bg-[#25D366] text-white hover:bg-[#20ba5a] hover:border-yellow-400 w-14 h-14 rounded-lg shadow-lg"
                      onClick={() =>
                        shareChristmasToSocial(
                          resultVideoUrl,
                          selectedTemplateId,
                          selectedMusicId,
                          'whatsapp'
                        )
                      }
                      title="Share to WhatsApp"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      disabled={isDownloading}
                      className="border-2 border-yellow-400/50 bg-gradient-to-r from-red-600 to-red-700 text-yellow-300 hover:from-red-700 hover:to-red-800 hover:border-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed w-14 h-14 rounded-lg shadow-lg flex items-center justify-center"
                      onClick={handleDownload}
                      title={isDownloading ? 'Downloading...' : 'Download'}
                    >
                      {isDownloading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-yellow-300" />
                      ) : (
                        <Download className="w-5 h-5 text-yellow-300" />
                      )}
                    </Button>
                  </div>
                )}


              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer - 从底部弹出 */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="bottom" className="h-[75vh] bg-black/50 backdrop-blur-sm border-none p-0 flex flex-col rounded-t-3xl overflow-hidden">
          <SheetTitle className="sr-only">Create Your Christmas Video</SheetTitle>
          {/* 可滚动内容区 */}
          <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-6">
            {/* 上传图片 + 提示词 + 模板选择 + 音乐 */}
            <div className="space-y-6">
              {/* 上传图片 */}
              <div>
                <h3 className="text-2xl tracking-wide font-semibold text-white mb-4 font-mountains">
                  1. Upload photo
                  <span className="ml-1 text-red-400">*</span>
                </h3>
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
                        <p className="text-white/80 text-sm" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>Tap to upload photo</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Template Selection */}
              <div>
                <h3 className="text-2xl tracking-wide font-semibold text-white mb-3 font-mountains">2. Template Selection</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar scroll-smooth">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setPrompt(tpl.prompt);
                        // 设置模板预览视频
                        if (tpl.previewVideo) {
                          setTemplatePreviewVideo(tpl.previewVideo);
                        }
                      }}
                      className={`relative rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${selectedTemplateId === tpl.id
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
                  ))}
                </div>
              </div>

              {/* 提示词输入 */}
              <div>
                <p className="text-sm text-yellow-300 mb-3" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                  Use a prompt to transform your photo into the scene you like.
                </p>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want the character to express or do..."
                  rows={3}
                  className="w-full bg-black/20 border-yellow-400/30 text-white placeholder-white/50 resize-none focus:border-yellow-400/60 p-0 px-3 py-1"
                  style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                />
              </div>

              {/* Choose music */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl tracking-wide font-semibold text-white font-mountains">3. Choose music</h3>
                  <div className="flex items-center gap-2 bg-black/20 rounded-full p-1 border border-yellow-400/30">
                    <button
                      type="button"
                      onClick={() => setGenderFilter('all')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${genderFilter === 'all'
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
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${genderFilter === 'male'
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
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${genderFilter === 'female'
                          ? 'bg-yellow-400/20 text-white border border-yellow-400/50'
                          : 'text-white/60 hover:text-white/80'
                        }`}
                      style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                    >
                      Female
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar scroll-smooth">
                  {/* 自定义音频上传按钮 */}
                  {customAudioFile ? (
                    <button
                      type="button"
                      onClick={() => handleSelectMusic('custom')}
                      className={`py-3 px-4 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${selectedMusicId === 'custom'
                          ? 'border-yellow-400 bg-yellow-400/20 text-white shadow-lg'
                          : 'border-yellow-400/30 bg-black/10 text-white/80 hover:border-yellow-400/60'
                        }`}
                      title={customAudioFile.name}
                    >
                      {selectedMusicId === 'custom' && currentMusicId === 'custom' && isMusicPlaying ? (
                        <Pause className="w-4 h-4 mr-1 text-yellow-300" />
                      ) : (
                        <Play className={`w-4 h-4 mr-1 ${selectedMusicId === 'custom' ? 'text-yellow-300' : ''}`} />
                      )}
                      <span className="text-xs mr-2" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>
                        {customAudioFile.name.length > 15
                          ? customAudioFile.name.substring(0, 15) + '...'
                          : customAudioFile.name}
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomAudio();
                        }}
                        className="hover:text-red-400 transition-colors cursor-pointer"
                        title="Remove custom audio"
                      >
                        <X className="w-4 h-4" />
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => customAudioInputRef.current?.click()}
                      className="py-3 px-4 rounded-lg border-2 border-dashed border-yellow-400/30 bg-black/10 text-white/80 hover:border-yellow-400/60 flex items-center justify-center transition-all flex-shrink-0 whitespace-nowrap"
                      title="Upload custom audio"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span className="text-xs" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>Upload Audio</span>
                    </button>
                  )}
                  <input
                    ref={customAudioInputRef}
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.flac"
                    onChange={handleCustomAudioUpload}
                    className="hidden"
                  />

                  {/* 预设音乐列表 */}
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
                        className={`py-3 px-4 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 whitespace-nowrap ${isActive
                            ? 'border-yellow-400 bg-yellow-400/20 text-white shadow-lg'
                            : 'border-yellow-400/30 bg-black/10 text-white/80 hover:border-yellow-400/60'
                          }`}
                        title={track.name}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 mr-1 text-yellow-300" />
                        ) : (
                          <Play className="w-4 h-4 mr-1" />
                        )}
                        <span className="text-xs" style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}>{track.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 固定在底部的生成按钮 */}
          <div className="px-6 pb-6 pt-4 border-t border-yellow-400/20 bg-black/50 flex justify-center">
            <Button
              disabled={!imageFile || !selectedMusicId || !prompt || !prompt.trim() || isGenerating}
              onClick={() => {
                if (isGenerating) return;
                if (isUpgradeMode) {
                  setIsUpgradeModeModalOpen(true);
                  return;
                }
                handleGenerateClick();
              }}
              className="relative w-auto px-8 bg-gradient-to-r from-[#DC2626] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#991B1B] text-white rounded-full py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              {isGenerating
                ? 'Generating...'
                : isUpgradeMode
                  ? 'Upgrade Plan'
                  : 'Create the video'}
              <Sparkles className="w-4 h-4 text-yellow-300" />
              {/* 积分显示 - Upgrade 模式下不显示，Trial 模式显示 Free */}
              {!isUpgradeMode && selectedMusicId && (
                <div
                  className="absolute -top-2 -right-10 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg"
                  style={{ fontFamily: 'var(--font-poppins), system-ui, -apple-system, sans-serif' }}
                >
                  {!isSignedIn || (trialAccess.mode === 'trial' && isSignedIn)
                    ? 'Free'
                    : effectiveDuration > 0
                      ? `${calculateCredits(effectiveDuration, '720p')} Credits`
                      : '11 Credits'}
                </div>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

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

      {/* 升级模式弹窗 */}
      <Dialog open={isUpgradeModeModalOpen} onOpenChange={setIsUpgradeModeModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Free Trial Limit</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Free trial limit reached
            </h3>
            <p className="text-muted-foreground mb-6">
              Free times can only be used for 480p/720p videos with audio duration within 15 seconds. Please upgrade your plan to generate longer videos or higher resolution videos.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setIsUpgradeModeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsUpgradeModeModalOpen(false);
                  window.open('/pricing', '_blank');
                }}
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
