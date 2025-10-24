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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GenerationState {
  status: 'demo' | 'loading' | 'result';
  progress: number;
  videoUrl?: string;
  taskId?: string;
}

export function Wans2vHero() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
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
        try { previewAudioRef.current.pause(); } catch {}
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
        try { previewAudioRef.current.pause(); } catch {}
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
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                      isDragOver === 'image' 
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
                <p className="text-muted-foreground text-sm mb-3">Supported formats: mp3, wav, m4a, ogg, flac</p>
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
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                        isDragOver === 'audio' 
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
                   <p className="text-muted-foreground/70 text-xs mt-2">
                     Need to edit your audio or extract audio from video?{' '}
                     <Link href="/audio-tools" className="text-primary hover:text-primary/80 underline">
                       Use our Audio Tools
                     </Link>
                   </p>
                </div>
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
           <div className="lg:col-span-3 relative rounded-2xl border  backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
            <div className="aspect-video  rounded-lg overflow-hidden relative">
              {generationState.status === 'demo' && (
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
              )}

              {generationState.status === 'loading' && (
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
              )}

              {generationState.status === 'result' && generationState.videoUrl && (
                <div className="w-full h-full relative">
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
                                     <Button
                     onClick={() => downloadVideo(generationState.videoUrl!)}
                     className="absolute top-4 right-4 bg-white/20 hover:bg-primary text-white rounded-full p-3 backdrop-blur-sm"
                     size="sm"
                   >
                     <Download className="h-5 w-5" />
                   </Button>
                </div>
              )}
            </div>
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
