'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, Play, Download, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/toast-provider';
import { useAuth } from '@clerk/nextjs';

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

  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { isSignedIn } = useAuth();

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
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast.showToast('Please select a valid image file', 'error');
    }
  };

  const handleAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const duration = await getAudioDuration(file);
      
      // 检查音频时长是否超过20秒
      if (duration > 20) {
        toast.showToast('Audio file must be 20 seconds or less', 'error');
        return;
      }
      
      setAudioFile(file);
      setAudioDuration(duration);
    } else {
      toast.showToast('Please select a valid audio file', 'error');
    }
  };

  const handleGenerate = async () => {
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

    setIsGenerating(true);
    setGenerationState({ status: 'loading', progress: 0 });

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
                                   <div className="border-2 border-dashed border-white/30 rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer" onClick={() => imageInputRef.current?.click()}>
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

              {/* Audio Upload */}
              <div>
                <Label htmlFor="audio-upload" className="text-base font-semibold text-foreground mb-3 block">
                  Upload Audio
                </Label>
                <div className="relative">
                  <input
                    ref={audioInputRef}
                    id="audio-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                                     <div 
                     className="flex items-center border border-white/30 rounded-lg px-3 py-2 hover:border-primary/50 transition-colors cursor-pointer"
                     onClick={() => audioInputRef.current?.click()}
                   >
                     <input
                       type="text"
                       placeholder="Choose audio file..."
                       value={audioFile ? `${audioFile.name} (${audioDuration.toFixed(1)}s)` : ''}
                       readOnly
                       className="flex-1 text-sm text-muted-foreground bg-transparent outline-none truncate pointer-events-none"
                     />
                     <div className="ml-2 h-8 w-8 flex items-center justify-center">
                       <Upload className="h-4 w-4 text-muted-foreground" />
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground/70 mt-2">Maximum duration: 20 seconds</p>
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
                       Estimated cost: {resolution === '480P' ? Math.ceil(audioDuration * 3) : Math.ceil(audioDuration * 5)} credits
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
