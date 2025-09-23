'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Upload, Play, Pause, Download, Loader2, X, HelpCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '../ui/toast-provider';
import { useAuth, useClerk } from '@clerk/nextjs';
import { useUserInfo } from '@/lib/providers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { isMobileDevice } from '@/lib/utils';

interface GenerationState {
  status: 'demo' | 'loading' | 'result';
  progress: number;
  videoUrl?: string;
  taskId?: string;
}

export default function MultiHero() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [leftAudioFile, setLeftAudioFile] = useState<File | null>(null);
  const [rightAudioFile, setRightAudioFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [order, setOrder] = useState<'meanwhile' | 'left_right' | 'right_left'>('meanwhile');
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('720p');
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'demo',
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [leftAudioDuration, setLeftAudioDuration] = useState<number>(0);
  const [rightAudioDuration, setRightAudioDuration] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] = useState(false);
  const [isInvalidAudioModalOpen, setIsInvalidAudioModalOpen] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const leftPreviewRef = useRef<HTMLAudioElement | null>(null);
  const rightPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [leftPreviewUrl, setLeftPreviewUrl] = useState<string | null>(null);
  const [rightPreviewUrl, setRightPreviewUrl] = useState<string | null>(null);
  const [isLeftPlaying, setIsLeftPlaying] = useState(false);
  const [isRightPlaying, setIsRightPlaying] = useState(false);
  const [isDragOver, setIsDragOver] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const leftAudioInputRef = useRef<HTMLInputElement>(null);
  const rightAudioInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { userInfo } = useUserInfo();

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [abortController]);

  // 检查登录状态
  const checkAuthAndProceed = (callback: () => void) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    callback();
  };

  // 获取音频时长 - 向上取整
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.ceil(audio.duration)); // 向上取整
      };
      audio.onerror = () => {
        resolve(0); // 如果出错，返回0
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(() => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setImageFile(file);
      } else {
        toast.showToast('Please select a valid image file', 'error');
      }
    });
  };

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    checkAuthAndProceed(() => {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        setImageFile(file);
      } else {
        toast.showToast('Please drop a valid image file', 'error');
      }
    });
  };

  const handleLeftAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(async () => {
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
        setLeftAudioFile(file);
        setLeftAudioDuration(duration);
      }
    });
  };

  const handleLeftAudioDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    checkAuthAndProceed(async () => {
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
        setLeftAudioFile(file);
        setLeftAudioDuration(duration);
      }
    });
  };

  const handleRightAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(async () => {
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
        setRightAudioFile(file);
        setRightAudioDuration(duration);
      }
    });
  };

  const handleRightAudioDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    checkAuthAndProceed(async () => {
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
        setRightAudioFile(file);
        setRightAudioDuration(duration);
      }
    });
  };

  // 从 AudioTools 页面接收处理后的音频 (Multi)
  useEffect(() => {
    const checkForAudioFromToolsMulti = () => {
      try {
        const audioDataStr = sessionStorage.getItem('audioToolsProcessedAudioMulti');
        if (audioDataStr) {
          const audioData = JSON.parse(audioDataStr);
          
          // 将 base64 数据转换为 File 对象
          fetch(audioData.data)
            .then(res => res.blob())
            .then(async (blob) => {
              const file = new File([blob], audioData.name, { type: audioData.type });
              const duration = await getAudioDuration(file);
              
              // 根据 audioType 设置到对应的音频位置
              if (audioData.audioType === 'left') {
                setLeftAudioFile(file);
                setLeftAudioDuration(duration);
                toast.showToast('Left audio loaded from Audio Tools', 'success');
              } else if (audioData.audioType === 'right') {
                setRightAudioFile(file);
                setRightAudioDuration(duration);
                toast.showToast('Right audio loaded from Audio Tools', 'success');
              }
            })
            .catch(error => {
              console.error('Failed to load audio from AudioTools Multi:', error);
              toast.showToast('Failed to load audio from Audio Tools', 'error');
            });
          
          // 清除 sessionStorage 中的数据
          sessionStorage.removeItem('audioToolsProcessedAudioMulti');
        }
      } catch (error) {
        console.error('Error processing audio from AudioTools Multi:', error);
      }
    };

    checkForAudioFromToolsMulti();
  }, [toast]);

  // Left preview lifecycle
  useEffect(() => {
    if (!leftAudioFile) {
      if (leftPreviewRef.current) { try { leftPreviewRef.current.pause(); } catch {} }
      if (leftPreviewUrl) URL.revokeObjectURL(leftPreviewUrl);
      setLeftPreviewUrl(null);
      setIsLeftPlaying(false);
      return;
    }
    const url = URL.createObjectURL(leftAudioFile);
    setLeftPreviewUrl(url);
    const el = leftPreviewRef.current;
    if (el) { el.src = url; el.load(); }
    return () => { if (leftPreviewRef.current) { try { leftPreviewRef.current.pause(); } catch {} } URL.revokeObjectURL(url); };
  }, [leftAudioFile]);

  useEffect(() => {
    const el = leftPreviewRef.current; if (!el) return;
    const onPlay = () => setIsLeftPlaying(true);
    const onPause = () => setIsLeftPlaying(false);
    const onEnded = () => setIsLeftPlaying(false);
    el.addEventListener('play', onPlay); el.addEventListener('pause', onPause); el.addEventListener('ended', onEnded);
    return () => { el.removeEventListener('play', onPlay); el.removeEventListener('pause', onPause); el.removeEventListener('ended', onEnded); };
  }, [leftPreviewRef.current]);

  const previewLeft = () => {
    if (!leftAudioFile || !leftPreviewRef.current) return;
    const el = leftPreviewRef.current;
    if (el.paused) { el.play().catch(() => toast.showToast('Preview failed', 'error')); } else { el.pause(); }
  };

  // Right preview lifecycle
  useEffect(() => {
    if (!rightAudioFile) {
      if (rightPreviewRef.current) { try { rightPreviewRef.current.pause(); } catch {} }
      if (rightPreviewUrl) URL.revokeObjectURL(rightPreviewUrl);
      setRightPreviewUrl(null);
      setIsRightPlaying(false);
      return;
    }
    const url = URL.createObjectURL(rightAudioFile);
    setRightPreviewUrl(url);
    const el = rightPreviewRef.current;
    if (el) { el.src = url; el.load(); }
    return () => { if (rightPreviewRef.current) { try { rightPreviewRef.current.pause(); } catch {} } URL.revokeObjectURL(url); };
  }, [rightAudioFile]);

  useEffect(() => {
    const el = rightPreviewRef.current; if (!el) return;
    const onPlay = () => setIsRightPlaying(true);
    const onPause = () => setIsRightPlaying(false);
    const onEnded = () => setIsRightPlaying(false);
    el.addEventListener('play', onPlay); el.addEventListener('pause', onPause); el.addEventListener('ended', onEnded);
    return () => { el.removeEventListener('play', onPlay); el.removeEventListener('pause', onPause); el.removeEventListener('ended', onEnded); };
  }, [rightPreviewRef.current]);

  const previewRight = () => {
    if (!rightAudioFile || !rightPreviewRef.current) return;
    const el = rightPreviewRef.current;
    if (el.paused) { el.play().catch(() => toast.showToast('Preview failed', 'error')); } else { el.pause(); }
  };


  // 计算积分消耗
  const calculateCredits = (): number => {
    if (leftAudioDuration === 0 || rightAudioDuration === 0) return 0;
    
    const maxDuration = Math.max(leftAudioDuration, rightAudioDuration);
    
    // 新规则：5秒以下固定积分，5秒以上按秒计算
    if (maxDuration <= 5) {
      if (resolution === '480p') return 5;
      if (resolution === '720p') return 10;
      return 15; // 1080p
    } else {
      const creditsPerSecond = resolution === '480p' ? 1 : resolution === '720p' ? 2 : 3;
      return maxDuration * creditsPerSecond;
    }
  };

  const handleGenerate = async () => {
    // 检查用户是否登录
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    // 检查用户积分
    if (!userInfo) {
      toast.error('User information not available, please try again');
      return;
    }

    if (!imageFile || !leftAudioFile || !rightAudioFile) {
      toast.info('Please upload image and both audio files');
      return;
    }

    if (leftAudioDuration === 0 || rightAudioDuration === 0) {
      toast.info('Could not get audio duration');
      return;
    }

    const requiredCredits = calculateCredits();
    if (userInfo.total_credits < requiredCredits) {
      setIsInsufficientCreditsModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setGenerationState({ status: 'loading', progress: 0, taskId: undefined, videoUrl: undefined }); // 重置状态，清除之前的 taskId
    setTaskCreated(false); // 重置任务创建状态
    
    // 创建新的 AbortController
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    // 启动虚假进度条 (约2-3分钟到达95%)
    const progressInterval = setInterval(() => {
      setGenerationState(prev => {
        if (prev.progress < 95) {
          // 进度条增长逻辑：总共约150秒(2.5分钟)到达95%
          if (prev.progress < 20) {
            return { ...prev, progress: prev.progress + Math.random() * 0.8 + 0.4 }; // 0.4-1.2% 增长
          } else if (prev.progress < 40) {
            return { ...prev, progress: prev.progress + Math.random() * 0.6 + 0.3 }; // 0.3-0.9% 增长
          } else if (prev.progress < 60) {
            return { ...prev, progress: prev.progress + Math.random() * 0.5 + 0.25 }; // 0.25-0.75% 增长
          } else if (prev.progress < 80) {
            return { ...prev, progress: prev.progress + Math.random() * 0.4 + 0.2 }; // 0.2-0.6% 增长
          } else if (prev.progress < 90) {
            return { ...prev, progress: prev.progress + Math.random() * 0.3 + 0.15 }; // 0.15-0.45% 增长
          } else {
            return { ...prev, progress: Math.min(prev.progress + Math.random() * 0.2 + 0.1, 95) }; // 0.1-0.3% 增长，但不超过95%
          }
        }
        return prev;
      });
    }, 1000);

    try {
      // 调用创建任务接口
      const createResult = await api.infiniteTalk.createMultiTask({
        image: imageFile,
        prompt: prompt.trim(),
        left_audio: leftAudioFile,
        left_duration: Math.round(leftAudioDuration),
        right_audio: rightAudioFile,
        right_duration: Math.round(rightAudioDuration),
        order: order,
        resolution: resolution,
      });

      if (createResult.code === 200 && createResult.data?.task_id) {
        const taskId = createResult.data.task_id;
        setGenerationState(prev => ({ ...prev, taskId }));
        setTaskCreated(true); // 任务创建成功，显示提示信息

        // 轮询检查任务状态
        const pollResult = await api.infiniteTalk.pollTaskStatus(
          taskId,
          () => {}, // 空函数，不使用API返回的进度
          newAbortController
        );
        
        clearInterval(progressInterval);
        setGenerationState({
          status: 'result',
          progress: 100,
          videoUrl: pollResult.image_url,
          taskId,
        });

        toast.showToast('Video generated successfully!', 'success');
      } else {
        throw new Error(createResult.msg || 'Failed to create task');
      }
    } catch (error) {
      console.error('Generation failed:', error);
      clearInterval(progressInterval);
      setGenerationState({ status: 'demo', progress: 0, taskId: undefined, videoUrl: undefined });
      setTaskCreated(false); // 重置任务创建状态
      
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      
      // 如果是取消错误，不显示错误提示
      if (errorMessage !== 'Polling cancelled') {
        toast.showToast(errorMessage, 'error');
      }
    } finally {
      setIsGenerating(false);
      setAbortController(null); // 清理 AbortController
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
      link.download = `infinitetalk-multi-${Date.now()}.mp4`;
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
    <section className="py-28 relative" id="hero">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 font-poppins flex items-center justify-center gap-3">
            InfiniteTalk Multi – Multi-Character AI Lip-Sync Video
       
          </h1>
          <h2 className="text-xl sm:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            With <span className="text-primary font-semibold">InfiniteTalk Multi</span>, create realistic conversational videos where multiple characters talk or sing in perfect sync. Multi-character lip-sync makes interactions natural and engaging.
          </h2>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left Side - Form (40%) */}
          <div className="lg:col-span-2 relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)]">
            <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              Create Multi-Character Video
        
            </h3>
            
            <div className="space-y-6">
              {/* Left Audio Upload */}
              <div>
                <div className="flex items-center gap-2 mb-2 justify-between">
                  <Label htmlFor="left-audio-upload" className="text-base font-semibold text-foreground">
                    Left Audio <span className="text-red-500">*</span>
                  </Label>
                  <div>
                    <Button type="button" size="sm" variant="outline" onClick={(e) => { e.preventDefault(); previewLeft(); }} disabled={!leftAudioFile}>
                      {isLeftPlaying ? (<><Pause className="w-4 h-4 mr-1" /> Pause</>) : (<><Play className="w-4 h-4 mr-1" /> Preview</>)}
                    </Button>
                    <audio ref={leftPreviewRef} className="hidden" controls preload="auto">
                      {leftPreviewUrl ? (<>
                        <source src={leftPreviewUrl} type={leftAudioFile?.type || ''} />
                        <source src={leftPreviewUrl} type="audio/mpeg" />
                        <source src={leftPreviewUrl} type="audio/mp4" />
                      </>) : null}
                    </audio>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Supported formats: mp3, wav, m4a, ogg, flac</p>
                <div className="relative">
                  <input
                    ref={leftAudioInputRef}
                    id="left-audio-upload"
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.flac"
                    onChange={handleLeftAudioUpload}
                    className="hidden"
                  />
                  <div 
                    className={`flex items-center border rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                      isDragOver === 'left-audio' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/30 hover:border-primary/50'
                    }`}
                    onClick={() => checkAuthAndProceed(() => leftAudioInputRef.current?.click())}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver('left-audio');
                    }}
                    onDragLeave={() => setIsDragOver(null)}
                    onDrop={handleLeftAudioDrop}
                  >
                    <input
                      type="text"
                      placeholder={isDragOver === 'left-audio' ? 'Drop audio file here...' : 'Choose left audio file...'}
                      value={leftAudioFile ? `${leftAudioFile.name} (${leftAudioDuration.toFixed(1)}s)` : ''}
                      readOnly
                      className="flex-1 text-sm text-muted-foreground bg-transparent outline-none truncate pointer-events-none"
                      title={leftAudioFile ? `${leftAudioFile.name} (${leftAudioDuration.toFixed(1)}s)` : ''}
                    />
                    <div className="ml-2 h-8 w-8 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground/70 text-xs mb-3">
                  Need to edit your audio or extract audio from video?{' '}
                  <Link href="/audio-tools" className="text-primary hover:text-primary/80 underline">
                    Use our Audio Tools
                  </Link>
                </p>
              </div>

              {/* Right Audio Upload */}
              <div>
                <div className="flex items-center gap-2 mb-2 justify-between">
                  <Label htmlFor="right-audio-upload" className="text-base font-semibold text-foreground">
                    Right Audio <span className="text-red-500">*</span>
                  </Label>
                  <div>
                    <Button type="button" size="sm" variant="outline" onClick={(e) => { e.preventDefault(); previewRight(); }} disabled={!rightAudioFile}>
                      {isRightPlaying ? (<><Pause className="w-4 h-4 mr-1" /> Pause</>) : (<><Play className="w-4 h-4 mr-1" /> Preview</>)}
                    </Button>
                    <audio ref={rightPreviewRef} className="hidden" controls preload="auto">
                      {rightPreviewUrl ? (<>
                        <source src={rightPreviewUrl} type={rightAudioFile?.type || ''} />
                        <source src={rightPreviewUrl} type="audio/mpeg" />
                        <source src={rightPreviewUrl} type="audio/mp4" />
                      </>) : null}
                    </audio>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Supported formats: mp3, wav, m4a, ogg, flac</p>
                <div className="relative">
                  <input
                    ref={rightAudioInputRef}
                    id="right-audio-upload"
                    type="file"
                    accept=".mp3,.wav,.m4a,.ogg,.flac"
                    onChange={handleRightAudioUpload}
                    className="hidden"
                  />
                  <div 
                    className={`flex items-center border rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                      isDragOver === 'right-audio' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/30 hover:border-primary/50'
                    }`}
                    onClick={() => checkAuthAndProceed(() => rightAudioInputRef.current?.click())}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver('right-audio');
                    }}
                    onDragLeave={() => setIsDragOver(null)}
                    onDrop={handleRightAudioDrop}
                  >
                    <input
                      type="text"
                      placeholder={isDragOver === 'right-audio' ? 'Drop audio file here...' : 'Choose right audio file...'}
                      value={rightAudioFile ? `${rightAudioFile.name} (${rightAudioDuration.toFixed(1)}s)` : ''}
                      readOnly
                      className="flex-1 text-sm text-muted-foreground bg-transparent outline-none truncate pointer-events-none"
                      title={rightAudioFile ? `${rightAudioFile.name} (${rightAudioDuration.toFixed(1)}s)` : ''}
                    />
                    <div className="ml-2 h-8 w-8 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground/70 text-xs mb-3">
                  Need to edit your audio or extract audio from video?{' '}
                  <Link href="/audio-tools" className="text-primary hover:text-primary/80 underline">
                    Use our Audio Tools
                  </Link>
                </p>
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label htmlFor="image-upload" className="text-base font-semibold text-foreground">
                    Upload Image <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="Upload a single image that will be used for both characters">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                {!imageFile ? (
                  <div 
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                      isDragOver === 'image' 
                        ? 'border-primary bg-primary/10' 
                        : 'border-white/30 hover:border-primary/50'
                    }`}
                    onClick={() => checkAuthAndProceed(() => imageInputRef.current?.click())}
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
                      {isDragOver === 'image' ? 'Drop image here' : 'Click to upload or drag & drop image'}
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

              {/* Prompt */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label htmlFor="prompt" className="text-base font-semibold text-foreground">
                    Prompt
                  </Label>
                  <Tooltip content="Describe what you want the characters to express or do">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want the characters to express or do..."
                  className="w-full h-24 bg-white/5 border-white/30 text-white placeholder-muted-foreground resize-none"
                />
              </div>

              {/* Order Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label className="text-base font-semibold text-foreground">
                    Order <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="The order of the two audio sources in the output video, 'meanwhile' means both audio sources will play at the same time, 'left_right' means the left audio will play first then the right audio will play, 'right_left' means the right audio will play first then the left audio will play.">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <select
                  value={order}
                  onChange={(e) => setOrder(e.target.value as 'meanwhile' | 'left_right' | 'right_left')}
                  className="w-full px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:outline-none focus:border-primary/50 hover:bg-white/10 transition-colors"
                >
                  <option value="meanwhile" className="bg-slate-900/90 text-white backdrop-blur-sm">Meanwhile</option>
                  <option value="left_right" className="bg-slate-900/90 text-white backdrop-blur-sm">Left to Right</option>
                  <option value="right_left" className="bg-slate-900/90 text-white backdrop-blur-sm">Right to Left</option>
                </select>
              </div>

              {/* Resolution Selection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label className="text-base font-semibold text-foreground">
                    Resolution <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="The resolution of the output video">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={resolution === '480p' ? 'default' : 'outline'}
                    onClick={() => setResolution('480p')}
                    size="sm"
                    className="px-3"
                  >
                    <div className="text-center">
                      <div className="text-sm font-bold">480P</div>
                   
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={resolution === '720p' ? 'default' : 'outline'}
                    onClick={() => setResolution('720p')}
                    size="sm"
                    className="px-3"
                  >
                    <div className="text-center">
                      <div className="text-sm font-bold">720P</div>
                     
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={resolution === '1080p' ? 'default' : 'outline'}
                    onClick={() => setResolution('1080p')}
                    size="sm"
                    className="px-3"
                  >
                    <div className="text-center">
                      <div className="text-sm font-bold">1080P</div>
                 
                    </div>
                  </Button>
                </div>
              </div>

              {/* Generate Button */}
              <div className="space-y-3 relative">
                {/* Estimated Credits Label */}
                <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                  {(() => {
                    if (leftAudioFile && rightAudioFile && (leftAudioDuration > 0 || rightAudioDuration > 0)) {
                      const maxDuration = Math.max(leftAudioDuration, rightAudioDuration);
                      // 新规则：5秒以下固定积分，5秒以上按秒计算
                      if (maxDuration <= 5) {
                        if (resolution === '480p') return '5 Credits';
                        if (resolution === '720p') return '10 Credits';
                        return '15 Credits'; // 1080p
                      } else {
                        const creditsPerSecond = resolution === '480p' ? 1 : resolution === '720p' ? 2 : 3;
                        return `${maxDuration * creditsPerSecond} Credits`;
                      }
                    } else {
                      // 没有音频文件时显示最低积分消耗
                      if (resolution === '480p') return '5 Credits';
                      if (resolution === '720p') return '10 Credits';
                      return '15 Credits'; // 1080p
                    }
                  })()}
                </div>
            
                <Button
                  onClick={handleGenerate}
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
            
    
                  <div className="text-xs text-muted-foreground/70 text-center">
                    Every 5 seconds: 480P requires 5 credits, 720P requires 10 credits, 1080P requires 15 credits
                  </div>
                  {leftAudioFile && rightAudioFile && (leftAudioDuration > 0 || rightAudioDuration > 0) && (
                    <div className="text-xs text-muted-foreground/70">
                      Estimated cost: {(() => {
                        const maxDuration = Math.max(leftAudioDuration, rightAudioDuration);
                        // 新规则：5秒以下固定积分，5秒以上按秒计算
                        if (maxDuration <= 5) {
                          if (resolution === '480p') return 5;
                          if (resolution === '720p') return 10;
                          return 15; // 1080p
                        } else {
                          const creditsPerSecond = resolution === '480p' ? 1 : resolution === '720p' ? 2 : 3;
                          return maxDuration * creditsPerSecond;
                        }
                      })()} credits
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Preview (60%) */}
          <div className="lg:col-span-3 relative rounded-2xl border backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] lg:sticky lg:top-20">
            <div className="aspect-video rounded-lg overflow-hidden relative">
              {generationState.status === 'demo' && (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <video
                    src="https://cfsource.infinitetalk.net/infinitetalk/multi/mutil-hero.mp4"
                    controls
                    preload="metadata"
                    className="w-full h-full object-cover rounded"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                  {/* Demo Video Label */}
                  <div className="absolute top-4 left-20 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    Demo Video
                  </div>
                </div>
              )}

              {generationState.status === 'loading' && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm p-4">
                  <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
                  <h2 className="text-xl font-semibold text-foreground mb-4">Generating Your Multi-Character Video...</h2>
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
                onClick={() => setIsInsufficientCreditsModalOpen(false)}
              >
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
