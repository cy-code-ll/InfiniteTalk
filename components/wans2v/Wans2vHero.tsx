'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Play, Pause, Download, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast-provider';
import { useAuth } from '@clerk/nextjs';
import { useUserInfo } from '@/lib/providers';
import Link from 'next/link';
import { isMobileDevice } from '@/lib/utils';
import { saveToIndexedDB, getFromIndexedDB, deleteFromIndexedDB } from '@/lib/indexedDB';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shareToSocial } from '@/lib/share-utils';

interface GenerationState {
  status: 'demo' | 'loading' | 'result';
  progress: number;
  videoUrl?: string;
  taskId?: string;
}

export function Wans2vHero() {
  // IndexedDB 缓存键名
  const CACHE_KEY = 'wans2v-form-cache';
  const SESSION_KEY = 'wans2v-session-active';

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [resolution, setResolution] = useState<'480P' | '720P'>('720P');
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'demo',
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] = useState(false);
  const [isInvalidAudioModalOpen, setIsInvalidAudioModalOpen] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isDragOver, setIsDragOver] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isSignedIn } = useAuth();
  const { userInfo } = useUserInfo();

  // 获取音频时长
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
      };
      audio.onerror = () => {
        resolve(0); // 如果出错，返回0
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  // 计算积分消耗
  const calculateCredits = (): number => {
    if (audioDuration === 0) return 0;

    const creditsPerSecond = resolution === '480P' ? 3 : 5;
    return Math.ceil(audioDuration * creditsPerSecond);
  };

  // 💾 保存表单到 IndexedDB
  const saveFormCache = async () => {
    try {
      await saveToIndexedDB(CACHE_KEY, {
        // 文件
        imageFile: imageFile,
        audioFile: audioFile,

        // 表单数据
        prompt: prompt,
        resolution: resolution,
        audioDuration: audioDuration,
      });
      console.log('✅ Wans2v form cached to IndexedDB');
    } catch (error) {
      console.error('❌ Failed to cache wans2v form:', error);
    }
  };

  // 🗑️ 清除缓存
  const clearFormCache = async () => {
    try {
      await deleteFromIndexedDB(CACHE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      console.log('✅ Wans2v cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear wans2v cache:', error);
    }
  };

  // 📥 恢复缓存数据
  const restoreFormCache = async () => {
    try {
      // 1️⃣ 检查是否是同一会话
      const isActiveSession = sessionStorage.getItem(SESSION_KEY);

      if (!isActiveSession) {
        // 新会话，清除旧缓存
        console.log('🆕 New session detected, clearing old wans2v cache...');
        await deleteFromIndexedDB(CACHE_KEY);
        // 设置会话标记
        sessionStorage.setItem(SESSION_KEY, 'true');
        return;
      }

      // 2️⃣ 检查是否有 AudioTools 返回的音频
      const audioToolsData = sessionStorage.getItem('audioToolsProcessedAudio');
      const hasNewAudio = !!audioToolsData;

      // 3️⃣ 从 IndexedDB 恢复数据
      const cache = await getFromIndexedDB(CACHE_KEY);

      if (cache) {
        console.log('📥 Restoring wans2v form data from cache...');

        // 恢复文件
        if (cache.imageFile) {
          setImageFile(cache.imageFile);
          console.log('✅ Image restored');
        }

        // 恢复音频 - 只有在没有新音频时才恢复
        if (cache.audioFile && !hasNewAudio) {
          setAudioFile(cache.audioFile);
          setAudioDuration(cache.audioDuration || 0);
          console.log('✅ Audio restored from cache');
        }

        // 恢复表单数据
        if (cache.prompt) setPrompt(cache.prompt);
        if (cache.resolution) setResolution(cache.resolution);

        toast.showToast('Form data restored!', 'success');
      }

      // 4️⃣ 处理 AudioTools 返回的新音频（这会在下面的 useEffect 中执行）

    } catch (error) {
      console.error('❌ Failed to restore wans2v cache:', error);
    }
  };

  // 📤 跳转 AudioTools 前保存
  const handleAudioToolsClick = () => {
    console.log('💾 Saving wans2v form before navigating to AudioTools...');
    saveFormCache();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast.showToast('Please select a valid image file', 'error');
    }
  };

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast.showToast('Please drop a valid image file', 'error');
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 检查音频格式 - 使用文件后缀名
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        setIsInvalidAudioModalOpen(true);
        return;
      }

      const duration = await getAudioDuration(file);

      // 检查音频时长是否超过600秒
      if (duration > 600) {
        toast.showToast('Audio file must be 600 seconds or less', 'error');
        return;
      }

      setAudioFile(file);
      setAudioDuration(duration);
    }
  };

  const handleAudioDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    const file = event.dataTransfer.files[0];
    if (file) {
      // 检查音频格式 - 使用文件后缀名
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.mp3', '.wav', '.m4a', '.ogg', '.flac'];
      const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));

      if (!hasValidExtension) {
        setIsInvalidAudioModalOpen(true);
        return;
      }

      const duration = await getAudioDuration(file);

      // 检查音频时长是否超过600秒
      if (duration > 600) {
        toast.showToast('Audio file must be 600 seconds or less', 'error');
        return;
      }

      setAudioFile(file);
      setAudioDuration(duration);
    }
  };

  // 删除选中的音频
  const removeAudioFile = () => {
    setAudioFile(null);
    setAudioDuration(0);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  // 📥 页面加载时恢复缓存数据
  React.useEffect(() => {
    const initCache = async () => {
      // 设置会话标记（如果不存在）
      if (!sessionStorage.getItem(SESSION_KEY)) {
        sessionStorage.setItem(SESSION_KEY, 'true');
      }

      // 恢复缓存数据
      await restoreFormCache();
    };

    initCache();
  }, []); // 只在组件挂载时执行

  // 从 AudioTools 页面接收处理后的音频
  React.useEffect(() => {
    const checkForAudioFromTools = () => {
      try {
        const audioDataStr = sessionStorage.getItem('audioToolsProcessedAudio');
        if (audioDataStr) {
          const audioData = JSON.parse(audioDataStr);

          // 将 base64 数据转换为 File 对象
          fetch(audioData.data)
            .then(res => res.blob())
            .then(async (blob) => {
              const file = new File([blob], audioData.name, { type: audioData.type });
              const duration = await getAudioDuration(file);

              // 检查音频时长是否超过600秒
              if (duration > 600) {
                toast.showToast('Audio file must be 600 seconds or less', 'error');
                return;
              }

              setAudioFile(file);
              setAudioDuration(duration);
            })
            .catch(error => {
              console.error('Failed to load audio from AudioTools:', error);
            });

          // 清除 sessionStorage 中的数据
          sessionStorage.removeItem('audioToolsProcessedAudio');
        }
      } catch (error) {
        console.error('Error processing audio from AudioTools:', error);
      }
    };

    checkForAudioFromTools();
  }, []);

  // 🔄 自动保存（防抖）
  React.useEffect(() => {
    // 只有在有数据时才保存
    if (!imageFile && !audioFile && !prompt) {
      return;
    }

    const timer = setTimeout(() => {
      saveFormCache();
    }, 2000); // 2秒防抖

    return () => clearTimeout(timer);
  }, [imageFile, audioFile, prompt, resolution, audioDuration]);

  // 🗑️ 生成成功后清除缓存
  React.useEffect(() => {
    if (generationState.status === 'result' && generationState.videoUrl) {
      console.log('🎬 Wans2v generation successful, clearing cache...');
      clearFormCache();
    }
  }, [generationState.status, generationState.videoUrl]);

  // ❌ 关闭标签页或离开页面时清除缓存
  React.useEffect(() => {
    const handlePageHide = () => {
      console.log('❌ Wans2v page closing, clearing cache...');
      deleteFromIndexedDB(CACHE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    };

    const handleBeforeUnload = () => {
      sessionStorage.removeItem(SESSION_KEY);
      console.log('⚠️ Wans2v session key removed, cache will be cleared on next load');
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 音频预览播放/暂停
  const previewSelectedAudio = () => {
    if (!audioFile || !previewAudioRef.current) return;
    const el = previewAudioRef.current;
    try {
      if (el.paused) {
        el.play().catch(() => {
          toast.showToast('Preview failed: format not supported', 'error');
        });
      } else {
        el.pause();
      }
    } catch {
      toast.showToast('Preview failed', 'error');
    }
  };

  // 维护 object URL
  React.useEffect(() => {
    if (!audioFile) {
      if (previewAudioRef.current) {
        try { previewAudioRef.current.pause(); } catch { }
      }
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
      setIsPreviewPlaying(false);
      return;
    }
    const url = URL.createObjectURL(audioFile);
    setPreviewAudioUrl(url);
    const el = previewAudioRef.current;
    if (el) {
      el.src = url;
      el.load();
    }
    return () => {
      if (previewAudioRef.current) {
        try { previewAudioRef.current.pause(); } catch { }
      }
      URL.revokeObjectURL(url);
    };
  }, [audioFile]);

  // 同步按钮状态
  React.useEffect(() => {
    const el = previewAudioRef.current;
    if (!el) return;
    const onPlay = () => setIsPreviewPlaying(true);
    const onPause = () => setIsPreviewPlaying(false);
    const onEnded = () => setIsPreviewPlaying(false);
    el.addEventListener('play', onPlay);
    el.addEventListener('pause', onPause);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('play', onPlay);
      el.removeEventListener('pause', onPause);
      el.removeEventListener('ended', onEnded);
    };
  }, [previewAudioRef.current]);


  const handleGenerate = async () => {
    // CNZZ 事件追踪 - 点击生成按钮
    if (typeof window !== 'undefined' && (window as any)._czc) {
      (window as any)._czc.push(['_trackEvent', '用户操作', '点击生成按钮', '/wan2.2-s2v', '1', '']);
      console.log('✅ CNZZ 事件追踪成功:', {
        事件类别: '用户操作',
        事件动作: '点击生成按钮',
        页面路径: '/wan2.2-s2v',
        完整数据: ['_trackEvent', '用户操作', '点击生成按钮', '/wan2.2-s2v', '1', '']
      });
    } else {
      console.warn('⚠️ CNZZ 未初始化，无法追踪事件');
    }

    // 检查用户是否登录
    if (!isSignedIn) {
      // 如果没有登录，调用 Clerk 登录
      window.location.href = '/sign-in';
      return;
    }

    if (!imageFile || !audioFile) {
      toast.showToast('Please upload both image and audio files', 'error');
      return;
    }

    if (audioDuration === 0) {
      toast.showToast('Could not get audio duration', 'error');
      return;
    }

    // 检查用户积分
    if (!userInfo) {
      toast.showToast('User information not available, please try again', 'error');
      return;
    }

    const requiredCredits = calculateCredits();
    if (userInfo.total_credits < requiredCredits) {
      setIsInsufficientCreditsModalOpen(true);
      // CNZZ 事件追踪 - 积分不足弹窗出现
      if (typeof window !== 'undefined' && (window as any)._czc) {
        (window as any)._czc.push(['_trackEvent', '系统弹窗', '积分不足弹窗', '/wan2.2-s2v', 1, '']);
        console.log('✅ CNZZ 事件追踪成功: 积分不足弹窗出现');
      }
      return;
    }

    setIsGenerating(true);
    setGenerationState({ status: 'loading', progress: 0 });
    setTaskCreated(false); // 重置任务创建状态

    // 模拟进度增长到90%
    const progressInterval = setInterval(() => {
      setGenerationState(prev => {
        if (prev.progress < 90) {
          return { ...prev, progress: prev.progress + Math.random() * 10 };
        }
        return prev;
      });
    }, 1000);

    try {
      // 调用创建任务接口
      const createResult = await api.video.infiniteTalk({
        image: imageFile,
        audio: audioFile,
        prompt: prompt,
        resolution: resolution,
        duration: Math.ceil(audioDuration),
      });

      if (createResult.code === 200 && createResult.data?.task_id) {
        const taskId = createResult.data.task_id;
        setGenerationState(prev => ({ ...prev, taskId }));
        setTaskCreated(true); // 任务创建成功，显示提示信息

        // 轮询检查任务状态
        const pollResult = await api.video.pollTaskStatus(taskId);

        clearInterval(progressInterval);
        setGenerationState({
          status: 'result',
          progress: 100,
          videoUrl: pollResult.video_url,
          taskId,
        });

        toast.showToast('Video generated successfully!', 'success');
      } else {
        throw new Error(createResult.msg || 'Failed to create task');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      clearInterval(progressInterval);
      setGenerationState({ status: 'demo', progress: 0 });
      setTaskCreated(false); // 重置任务创建状态
      toast.showToast(
        error instanceof Error ? error.message : 'Generation failed',
        'error'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVideo = async (videoUrl: string) => {
    try {
      const response = await fetch(videoUrl, { mode: 'cors' });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `wan2.2-s2v-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(objectUrl);
      toast.showToast('Video downloaded successfully!', 'success');
    } catch (error) {
      console.error('Download failed:', error);
      toast.showToast('Download failed. Please try again.', 'error');
    }
  };

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-poppins">
            Wan-S2V – From Audio and Images to Cinematic AI Videos
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            With Wan-S2V, turn static images and audio into cinematic-quality videos. Generate natural expressions, body motion, and professional camera work in minutes.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left Side - Form */}
          <div className="lg:col-span-2 relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
            <h3 className="text-2xl font-bold text-foreground mb-6">Create Your Digital Human</h3>

            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label htmlFor="image-upload" className="text-base font-semibold text-foreground mb-3 block">
                  Upload Image
                </Label>
                {!imageFile ? (
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${isDragOver === 'image'
                        ? 'border-primary bg-primary/10'
                        : 'border-white/30 hover:border-primary/50'
                      }`}
                    onClick={() => imageInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver('image');
                    }}
                    onDragLeave={() => setIsDragOver(null)}
                    onDrop={handleImageDrop}
                  >
                    <input
                      ref={imageInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {isDragOver === 'image' ? 'Drop image here' : 'click upload image'}
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="Preview"
                      className="w-full h-32 object-contain rounded-lg border border-white/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setImageFile(null)}
                      className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/20 hover:bg-white/30 rounded-full shadow-sm"
                    >
                      <X className="h-4 w-4 text-foreground" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Audio Upload */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="audio-upload" className="text-base font-semibold text-foreground">
                    Upload Audio
                  </Label>
                  <div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={(e) => { e.preventDefault(); previewSelectedAudio(); }}
                      disabled={!audioFile}
                    >
                      {isPreviewPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" /> Preview
                        </>
                      )}
                    </Button>
                    {/* Hidden audio for preview */}
                    <audio ref={previewAudioRef} className="hidden" controls preload="auto">
                      {previewAudioUrl ? (
                        <>
                          <source src={previewAudioUrl} type={audioFile?.type || ''} />
                          <source src={previewAudioUrl} type="audio/mpeg" />
                          <source src={previewAudioUrl} type="audio/mp4" />
                        </>
                      ) : null}
                    </audio>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm mb-3">
                  <span className="text-muted-foreground">MP3,WAV,M4A,OGG,FLAC</span>
                  <Link
                    href="/audio-tools"
                    className="text-primary hover:text-primary/80 underline"
                    onClick={handleAudioToolsClick}
                  >
                    Audio Cut
                  </Link>
                </div>
                <div className="relative">
                  <input
                    ref={audioInputRef}
                    id="audio-upload"
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.flac"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  {!audioFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${isDragOver === 'audio'
                          ? 'border-primary bg-primary/10'
                          : 'border-white/30 hover:border-primary/50'
                        }`}
                      onClick={() => audioInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver('audio');
                      }}
                      onDragLeave={() => setIsDragOver(null)}
                      onDrop={handleAudioDrop}
                    >
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {isDragOver === 'audio' ? 'Drop audio here' : 'click and drop upload audio'}
                      </p>
                    </div>
                  ) : (
                    <div className="relative bg-white/5 rounded-lg border border-white/20 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-3 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm text-white font-medium truncate" title={audioFile.name}>
                              {audioFile.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Duration: {audioDuration.toFixed(1)}s
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeAudioFile}
                          className="h-8 w-8 p-0 bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 rounded-full shadow-sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground/70 mt-2">Maximum duration: 600 seconds</p>
                </div>
              </div>

              {/* Prompt Input */}
              <div>
                <Label htmlFor="prompt-input" className="text-base font-semibold text-foreground mb-3 block">
                  Prompt
                </Label>
                <textarea
                  id="prompt-input"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your prompt here..."
                  className="w-full min-h-[100px] px-4 py-3 rounded-lg border border-white/20 bg-white/5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              {/* Resolution Selection */}
              <div>
                <Label className="text-base font-semibold text-foreground mb-3 block">
                  Resolution
                </Label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={resolution === '480P' ? 'default' : 'outline'}
                    onClick={() => setResolution('480P')}
                    size="sm"
                    className="px-6"
                  >
                    480P
                  </Button>
                  <Button
                    type="button"
                    variant={resolution === '720P' ? 'default' : 'outline'}
                    onClick={() => setResolution('720P')}
                    size="sm"
                    className="px-6"
                  >
                    720P
                  </Button>
                </div>
              </div>

              {/* Generate Button */}
              <div className="space-y-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!imageFile || !audioFile || isGenerating}
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Now'
                  )}
                </Button>

                {/* Credits Info */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>480P: 3 credits/sec</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary/70 rounded-full"></span>
                      <span>720P: 5 credits/sec</span>
                    </div>
                  </div>
                  {audioFile && audioDuration > 0 && (
                    <div className="text-xs text-muted-foreground/70">
                      Estimated cost: {calculateCredits()} credits
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Preview */}
          <div className="lg:col-span-3 relative rounded-2xl border  backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] p-4">
            {generationState.status === 'demo' && (
              <div className="aspect-video  rounded-lg overflow-hidden relative">
                <div className="w-full h-full flex items-center justify-center p-4">
                  <video
                    src="https://cfsource.infinitetalk.net/infinitetalk/video/demo.mp4"
                    controls
                    muted
                    autoPlay
                    preload="metadata"
                    className="w-full h-full object-cover rounded"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}

            {generationState.status === 'loading' && (
              <div className="aspect-video  rounded-lg overflow-hidden relative">
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm p-4">
                  <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                  <h2 className="text-xl font-semibold text-foreground mb-4">Generating Your Video...</h2>
                  <div className="w-3/4 mb-4">
                    <Progress value={generationState.progress} className="h-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">{Math.round(generationState.progress)}% Complete</p>
                  {taskCreated && (
                    <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
                      <p className="text-white text-sm text-center">
                        You don't need to wait here. Check your work in the{' '}
                        <Link href="/profile" className="text-primary hover:text-primary/80 underline">
                          Profile Center
                        </Link>{' '}
                        after 5 minutes.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {generationState.status === 'result' && generationState.videoUrl && (
              <div className="space-y-3">
                <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                  <video
                    src={generationState.videoUrl}
                    controls
                    muted
                    preload="metadata"
                    className="w-full h-full object-contain"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Download and Share Buttons */}
                <div className="flex gap-2 justify-center items-center">
                  {/* Download Button */}
                  <Button
                    onClick={() => downloadVideo(generationState.videoUrl!)}
                    variant="outline"
                    className="flex items-center justify-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>

                  {/* Share Buttons */}
                  {generationState.taskId && (
                    <>
                      {/* Twitter */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => shareToSocial(generationState.taskId!, 'twitter')}
                        title="Share to Twitter"
                        className="hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      </Button>

                      {/* Facebook */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => shareToSocial(generationState.taskId!, 'facebook')}
                        title="Share to Facebook"
                        className="hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </Button>

                      {/* WhatsApp */}
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => shareToSocial(generationState.taskId!, 'whatsapp')}
                        title="Share to WhatsApp"
                        className="hover:bg-[#25D366] hover:text-white hover:border-[#25D366]"
                      >
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Insufficient Credits Modal */}
      <Dialog open={isInsufficientCreditsModalOpen} onOpenChange={setIsInsufficientCreditsModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Insufficient Credits</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Not enough credits
            </h3>
            <p className="text-muted-foreground mb-6">
              You need at least {calculateCredits()} credits to generate video. Please purchase more credits to continue.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  // CNZZ 事件追踪 - 关闭积分不足弹窗
                  if (typeof window !== 'undefined' && (window as any)._czc) {
                    (window as any)._czc.push(['_trackEvent', '用户操作', '积分不足-关闭弹窗', '/wan2.2-s2v', 1, '']);
                    console.log('✅ CNZZ 事件追踪成功: 积分不足-关闭弹窗');
                  }
                  setIsInsufficientCreditsModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // CNZZ 事件追踪 - 积分不足购买积分
                  if (typeof window !== 'undefined' && (window as any)._czc) {
                    (window as any)._czc.push(['_trackEvent', '用户操作', '积分不足-购买积分', '/wan2.2-s2v', 1, '']);
                    console.log('✅ CNZZ 事件追踪成功: 积分不足-购买积分');
                  }
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

      {/* Invalid Audio Format Modal */}
      <Dialog open={isInvalidAudioModalOpen} onOpenChange={setIsInvalidAudioModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Invalid Audio Format</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Unsupported audio format
            </h3>
            <p className="text-muted-foreground mb-6">
              Please upload audio files in supported formats: mp3, wav, m4a, ogg, flac
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => setIsInvalidAudioModalOpen(false)}
                className="w-full"
              >
                OK
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </section>
  );
}
