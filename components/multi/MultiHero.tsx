'use client';

import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Upload, Play, Download, Loader2, X, HelpCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '../ui/toast-provider';
import { useAuth, useClerk } from '@clerk/nextjs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

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
  const [resolution, setResolution] = useState<'480p' | '720p'>('720p');
  const [generationState, setGenerationState] = useState<GenerationState>({
    status: 'demo',
    progress: 0,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [leftAudioDuration, setLeftAudioDuration] = useState<number>(0);
  const [rightAudioDuration, setRightAudioDuration] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const leftAudioInputRef = useRef<HTMLInputElement>(null);
  const rightAudioInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  // 检查登录状态
  const checkAuthAndProceed = (callback: () => void) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    callback();
  };

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

  const handleLeftAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(async () => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('audio/')) {
        const duration = await getAudioDuration(file);
        setLeftAudioFile(file);
        setLeftAudioDuration(duration);
      } else {
        toast.showToast('Please select a valid audio file', 'error');
      }
    });
  };

  const handleRightAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(async () => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('audio/')) {
        const duration = await getAudioDuration(file);
        setRightAudioFile(file);
        setRightAudioDuration(duration);
      } else {
        toast.showToast('Please select a valid audio file', 'error');
      }
    });
  };

  const handleGenerate = async () => {
    // 检查用户是否登录
    if (!isSignedIn) {
      openSignIn();
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

    setIsGenerating(true);
    setGenerationState({ status: 'loading', progress: 0 });

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

        // 轮询检查任务状态
        const pollResult = await api.infiniteTalk.pollTaskStatus(
          taskId,
          () => {} // 空函数，不使用API返回的进度
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
      setGenerationState({ status: 'demo', progress: 0 });
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
            <Tooltip content="Multi-character AI lip-sync video generation tool">
              <HelpCircle className="h-6 w-6 text-muted-foreground cursor-help" />
            </Tooltip>
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
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="left-audio-upload" className="text-base font-semibold text-foreground">
                    Left Audio <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="Upload the first audio file for the left character">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Supported formats: mp3, wav, m4a, ogg, flac</p>
                <div className="relative">
                  <input
                    ref={leftAudioInputRef}
                    id="left-audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleLeftAudioUpload}
                    className="hidden"
                  />
                  <div 
                    className="flex items-center border border-white/30 rounded-lg px-3 py-2 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => checkAuthAndProceed(() => leftAudioInputRef.current?.click())}
                  >
                    <input
                      type="text"
                      placeholder="Choose left audio file..."
                      value={leftAudioFile ? `${leftAudioFile.name} (${leftAudioDuration.toFixed(1)}s)` : ''}
                      readOnly
                      className="flex-1 text-sm text-muted-foreground bg-transparent outline-none truncate pointer-events-none"
                    />
                    <div className="ml-2 h-8 w-8 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Audio Upload */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="right-audio-upload" className="text-base font-semibold text-foreground">
                    Right Audio <span className="text-red-500">*</span>
                  </Label>
                  <Tooltip content="Upload the second audio file for the right character">
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </Tooltip>
                </div>
                <p className="text-muted-foreground text-sm mb-3">Supported formats: mp3, wav, m4a, ogg, flac</p>
                <div className="relative">
                  <input
                    ref={rightAudioInputRef}
                    id="right-audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleRightAudioUpload}
                    className="hidden"
                  />
                  <div 
                    className="flex items-center border border-white/30 rounded-lg px-3 py-2 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => checkAuthAndProceed(() => rightAudioInputRef.current?.click())}
                  >
                    <input
                      type="text"
                      placeholder="Choose right audio file..."
                      value={rightAudioFile ? `${rightAudioFile.name} (${rightAudioDuration.toFixed(1)}s)` : ''}
                      readOnly
                      className="flex-1 text-sm text-muted-foreground bg-transparent outline-none truncate pointer-events-none"
                    />
                    <div className="ml-2 h-8 w-8 flex items-center justify-center">
                      <Upload className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
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
                  <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => checkAuthAndProceed(() => imageInputRef.current?.click())}>
                    <input
                      ref={imageInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
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
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={resolution === '480p' ? 'default' : 'outline'}
                    onClick={() => setResolution('480p')}
                    size="sm"
                    className="px-6"
                  >
                    480P
                  </Button>
                  <Button
                    type="button"
                    variant={resolution === '720p' ? 'default' : 'outline'}
                    onClick={() => setResolution('720p')}
                    size="sm"
                    className="px-6"
                  >
                    720P
                  </Button>
                </div>
              </div>

              {/* Generate Button */}
              <div className="space-y-3 relative">
                {/* Credits Label */}
                <div className="absolute -top-8 right-0 text-xs text-muted-foreground">
                  {resolution === '480p' ? '1 Credits/sec' : '2 Credits/sec'}
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
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      <span>480P: 1 credits/sec</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-primary/70 rounded-full"></span>
                      <span>720P: 2 credits/sec</span>
                    </div>
                  </div>
                  {leftAudioFile && rightAudioFile && (leftAudioDuration > 0 || rightAudioDuration > 0) && (
                    <div className="text-xs text-muted-foreground/70">
                      Estimated cost: {resolution === '480p' ? Math.ceil(Math.max(leftAudioDuration, rightAudioDuration) * 1) : Math.ceil(Math.max(leftAudioDuration, rightAudioDuration) * 2)} credits
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
                    src="/multi/mutil-hero.mp4"
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
    </section>
  );
}
