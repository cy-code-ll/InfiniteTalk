'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import { useToast } from '../../components/ui/toast-provider';
import { useUser, useClerk } from '@clerk/nextjs';
import { useUserInfo } from '@/lib/providers';
import { Upload, X, Download, Play, Pause, FileAudio } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, isMobileDevice } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ViewState = 'videodemo' | 'loading' | 'result';
type TabMode = 'image-to-video' | 'video-to-video';

// 下载媒体文件的函数（从profile页面复制）
async function downloadMediaWithCors(
  mediaUrl: string,
  filename: string,
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void
) {
  try {
    // 1. 发起 fetch 请求
    const response = await fetch(mediaUrl, { mode: 'cors' });

    // 检查响应是否成功并且是 CORS 允许的
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}. Failed to fetch media. Check CORS headers on the server.`);
    }

    // 2. 将响应体转换为 Blob 对象
    const blob = await response.blob();

    // 3. 创建一个指向 Blob 的 Object URL
    const objectUrl = URL.createObjectURL(blob);

    // 4. 创建 <a> 标签并触发下载
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename || `infinitetalk-video.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 5. 释放 Object URL 资源
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

export default function InfiniteTalkGenerator() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const toast = useToast();
  const { userInfo } = useUserInfo();

  // Form state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [resolution, setResolution] = useState<'480p' | '720p' | '1080p'>('480p');
  const [tabMode, setTabMode] = useState<TabMode>('image-to-video');

  // UI state
  const [viewState, setViewState] = useState<ViewState>('videodemo');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultVideoUrl, setResultVideoUrl] = useState<string>('');
  const [progressInterval, setProgressInterval] = useState<NodeJS.Timeout | null>(null);
  const [isInsufficientCreditsModalOpen, setIsInsufficientCreditsModalOpen] = useState(false);
  const [isInvalidAudioModalOpen, setIsInvalidAudioModalOpen] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewAudioUrl, setPreviewAudioUrl] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [isDragOver, setIsDragOver] = useState<string | null>(null);

  // Mask drawing state
  const [isMaskModalOpen, setIsMaskModalOpen] = useState(false);
  const [maskImageData, setMaskImageData] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);

  // 缓存图片 URL，避免频繁创建 blob 链接
  const imageUrl = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
    return null;
  }, [selectedImage]);

  // 清理 blob URL
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Preview helper: robust playback with multiple type fallbacks
  const previewSelectedAudio = useCallback(() => {
    if (!selectedAudio || !previewAudioRef.current) return;
    const el = previewAudioRef.current;
    try {
      if (el.paused) {
        el.play().catch(() => {
          toast.error('Preview failed: format not supported');
        });
      } else {
        el.pause();
      }
    } catch {
      toast.error('Preview failed');
    }
  }, [selectedAudio, toast]);

  // Maintain object URL for preview <audio>
  useEffect(() => {
    if (!selectedAudio) {
      if (previewAudioRef.current) {
        try { previewAudioRef.current.pause(); } catch { /* no-op */ }
      }
      if (previewAudioUrl) URL.revokeObjectURL(previewAudioUrl);
      setPreviewAudioUrl(null);
      setIsPreviewPlaying(false);
      return;
    }
    const url = URL.createObjectURL(selectedAudio);
    setPreviewAudioUrl(url);
    const el = previewAudioRef.current;
    if (el) {
      el.src = url;
      el.load();
    }
    return () => {
      if (previewAudioRef.current) {
        try { previewAudioRef.current.pause(); } catch { /* no-op */ }
      }
      URL.revokeObjectURL(url);
    };
  }, [selectedAudio]);

  // Track play/pause/ended to update button state
  useEffect(() => {
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

  // 启动虚假进度条 (约1分钟到达95%)
  const startFakeProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        // 进度条增长逻辑：总共约60秒到达95%
        if (prev < 25) {
          return prev + Math.random() * 2 + 1; // 1-3% 增长
        } else if (prev < 50) {
          return prev + Math.random() * 1.5 + 0.8; // 0.8-2.3% 增长
        } else if (prev < 75) {
          return prev + Math.random() * 1.2 + 0.6; // 0.6-1.8% 增长
        } else if (prev < 90) {
          return prev + Math.random() * 0.8 + 0.4; // 0.4-1.2% 增长
        } else if (prev < 95) {
          return Math.min(prev + Math.random() * 0.3 + 0.1, 95); // 0.1-0.4% 增长，但不超过95%
        } else {
          return 95; // 停在95%，不再增长
        }
      });
    }, 1000); // 每1秒更新一次

    setProgressInterval(interval);
  };

  // 停止虚假进度条
  const stopFakeProgress = () => {
    if (progressInterval) {
      clearInterval(progressInterval);
      setProgressInterval(null);
    }
  };

  // 完成进度条
  const completeProgress = () => {
    stopFakeProgress();
    setProgress(100);
  };

  // Refs
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const demoVideoRef = useRef<HTMLVideoElement>(null);
  const resultVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);



  // 组件卸载时清理定时器和轮询
  useEffect(() => {
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      if (abortController) {
        abortController.abort();
      }
    };
  }, [progressInterval, abortController]);

  // 检查登录状态并执行操作
  const checkAuthAndProceed = (callback: () => void) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    callback();
  };

  // 处理图片上传
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(() => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedImage(file);
        setMaskImageData(null);
      }
    });
  };

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    checkAuthAndProceed(() => {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        setSelectedImage(file);
        setMaskImageData(null);
      } else {
        toast.error('Please drop a valid image file');
      }
    });
  };

  // 处理视频上传
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(() => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('video/')) {
        setSelectedVideo(file);
      }
    });
  };

  const handleVideoDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    checkAuthAndProceed(() => {
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        setSelectedVideo(file);
      } else {
        toast.error('Please drop a valid video file');
      }
    });
  };

  // 处理音频上传
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    checkAuthAndProceed(() => {
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

        setSelectedAudio(file);

        // 获取音频时长
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(Math.ceil(audio.duration));
          URL.revokeObjectURL(audio.src);
        });
      }
    });
  };

  const handleAudioDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(null);
    checkAuthAndProceed(() => {
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

        setSelectedAudio(file);

        // 获取音频时长
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.addEventListener('loadedmetadata', () => {
          setAudioDuration(Math.ceil(audio.duration));
          URL.revokeObjectURL(audio.src);
        });
      }
    });
  };

  // 从 AudioTools 页面接收处理后的音频
  useEffect(() => {
    const checkForAudioFromTools = () => {
      try {
        const audioDataStr = sessionStorage.getItem('audioToolsProcessedAudio');
        if (audioDataStr) {
          const audioData = JSON.parse(audioDataStr);

          // 将 base64 数据转换为 File 对象
          fetch(audioData.data)
            .then(res => res.blob())
            .then(blob => {
              const file = new File([blob], audioData.name, { type: audioData.type });
              setSelectedAudio(file);

              // 获取音频时长
              const audio = new Audio();
              audio.src = URL.createObjectURL(file);
              audio.addEventListener('loadedmetadata', () => {
                setAudioDuration(Math.ceil(audio.duration));
                URL.revokeObjectURL(audio.src);
              });
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

  // 初始化画布
  useEffect(() => {
    if (isMaskModalOpen && selectedImage) {
      // 延迟初始化，确保DOM已渲染
      setTimeout(() => {
        initializeCanvas();
      }, 100);
    }
  }, [isMaskModalOpen, selectedImage]);


  // 删除选中的图片
  const removeSelectedImage = () => {
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // 删除选中的视频
  const removeSelectedVideo = () => {
    setSelectedVideo(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  // 删除选中的音频
  const removeSelectedAudio = () => {
    setSelectedAudio(null);
    setAudioDuration(0);
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  // 遮罩绘制相关函数
  const initializeCanvas = useCallback(() => {
    if (!canvasRef.current || !selectedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布尺寸为显示区域尺寸
    const container = canvas.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // 填充透明背景（让原图透过）
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 保存初始状态
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setCanvasHistory([imageData]);
    setHistoryIndex(0);
  }, [selectedImage]);

  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = canvasHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setCanvasHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undoCanvas = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.putImageData(canvasHistory[newIndex], 0, 0);
        }
      }
    }
  };

  const redoCanvas = () => {
    if (historyIndex < canvasHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.putImageData(canvasHistory[newIndex], 0, 0);
        }
      }
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    // 处理触摸事件和鼠标事件
    if ('touches' in e && e.touches.length > 0) {
      // 触摸事件
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      // 鼠标事件
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      return;
    }

    // 检查是否在画布范围内
    if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
      return;
    }

    // 使用半透明白色绘制，让用户看到绘制效果
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  // 处理鼠标和触摸移动事件，即使不在画布上也能继续绘制
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x: number, y: number;

    // 处理触摸事件和鼠标事件
    if ('touches' in e && e.touches.length > 0) {
      // 触摸事件
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else if ('clientX' in e) {
      // 鼠标事件
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    } else {
      return;
    }

    // 检查是否在画布范围内
    const isInCanvas = x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height;

    // 只有在画布范围内才更新鼠标位置，避免不必要的状态更新
    if (isInCanvas) {
      setMousePosition({ x, y });
    } else {
      // 如果不在画布范围内，清除鼠标位置
      setMousePosition(null);
    }

    // 如果正在绘制且在画布范围内
    if (isDrawing && isInCanvas) {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 使用半透明白色绘制，让用户看到绘制效果
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [isDrawing, brushSize]);

  // 处理鼠标释放事件
  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
    // 清除鼠标位置
    setMousePosition(null);
  }, [isDrawing]);

  // 添加全局鼠标和触摸事件监听器
  useEffect(() => {
    if (isMaskModalOpen) {
      // 添加全局鼠标和触摸事件监听器
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        // 清理事件监听器
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isMaskModalOpen, handleMouseMove, handleMouseUp]);

  const generateMaskImage = (): string => {
    if (!canvasRef.current) return '';

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 创建一个新的画布来生成最终的遮罩图
    const maskCanvas = document.createElement('canvas');
    const maskCtx = maskCanvas.getContext('2d');
    if (!maskCtx) return '';

    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;

    // 填充黑色背景
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    // 将原画布的内容复制到新画布，但将半透明白色转换为纯白色
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 0) {
        // 如果有绘制内容，设置为白色
        data[i] = 255;     // R
        data[i + 1] = 255; // G
        data[i + 2] = 255; // B
        data[i + 3] = 255; // A
      } else {
        // 如果没有绘制内容，确保是黑色
        data[i] = 0;       // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 255; // A
      }
    }

    maskCtx.putImageData(imageData, 0, 0);
    return maskCanvas.toDataURL('image/png');
  };

  const handleUseMask = () => {
    const maskData = generateMaskImage();
    setMaskImageData(maskData);
    setIsMaskModalOpen(false);
    toast.showToast('Mask created successfully!', 'success');
    setMousePosition(null);
  };

  const handleCancelMask = () => {
    setIsMaskModalOpen(false);
    // 重置画布为透明
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setCanvasHistory([]);
    setHistoryIndex(-1);
    setMousePosition(null);
  };

  const removeMask = () => {
    setMaskImageData(null);
    toast.showToast('Mask removed', 'info');
  };

  // 计算积分消耗 - 新规则：5s以下固定积分，5s以上按秒计算
  const calculateCredits = (): number => {
    if (audioDuration === 0) return 0;

    // 音乐时长向上取整
    const roundedDuration = Math.ceil(audioDuration);

    // 新规则：5秒以下固定积分，5秒以上按秒计算
    if (roundedDuration <= 5) {
      // 5秒以下：480P=5积分，720P=10积分，1080P=15积分
      if (resolution === '480p') return 5;
      if (resolution === '720p') return 10;
      return 15; // 1080p
    } else {
      // 5秒以上：480P=1积分/秒，720P=2积分/秒，1080P=3积分/秒
      const creditsPerSecond = resolution === '480p' ? 1 : resolution === '720p' ? 2 : 3;
      return roundedDuration * creditsPerSecond;
    }
  };

  // 验证表单
  const validateForm = (): string | null => {
    if (tabMode === 'image-to-video') {
      if (!selectedImage) return 'Please upload an image';
    } else {
      if (!selectedVideo) return 'Please upload a video';
    }
    if (!selectedAudio) return 'Please upload an audio file';
    if (audioDuration === 0) return 'Audio duration could not be determined';
    return null;
  };

  // 生成视频
  const handleGenerate = async () => {
    // 检查登录状态
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    // 检查用户积分
    if (!userInfo) {
      toast.error('User information not available, please try again');
      return;
    }

    const requiredCredits = calculateCredits();
    if (userInfo.total_credits < requiredCredits) {
      setIsInsufficientCreditsModalOpen(true);
      return;
    }

    // 验证表单
    const validationError = validateForm();
    if (validationError) {
      toast.info(validationError);
      return;
    }

    setIsGenerating(true);
    setViewState('loading');
    setProgress(0);
    setTaskCreated(false); // 重置任务创建状态

    // 创建新的 AbortController
    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    // 启动虚假进度条
    startFakeProgress();

    try {
      let createResult;

      if (tabMode === 'image-to-video') {
        // Image to Video 模式
        createResult = await api.infiniteTalk.createTask({
          image: selectedImage!,
          audio: selectedAudio!,
          prompt: prompt.trim(),
          duration: audioDuration,
          resolution: resolution,
          mask: maskImageData || undefined, // 添加遮罩图
        });
      } else {
        // Video to Video 模式
        createResult = await api.infiniteTalk.createVideoToVideoTask({
          video: selectedVideo!,
          audio: selectedAudio!,
          prompt: prompt.trim(),
          duration: audioDuration,
          resolution: resolution,
        });
      }

      if (createResult.code !== 200 || !createResult.data?.task_id) {
        const errorMsg = createResult.msg || 'Failed to create task';
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      const taskId = createResult.data.task_id;
      setTaskCreated(true); // 任务创建成功，显示提示信息

      // 轮询任务状态（不使用API进度，只检查状态）
      const result = await api.infiniteTalk.pollTaskStatus(
        taskId,
        () => { }, // 空函数，不使用API返回的进度
        newAbortController
      );

      // 任务完成时，完成进度条
      completeProgress();

      // 稍等一下让用户看到100%，然后切换到结果
      setTimeout(() => {
        setResultVideoUrl(result.image_url);
        setViewState('result');
        toast.success('Video generated successfully!');
      }, 800);

    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';

      // 如果是取消错误，不显示错误提示
      if (errorMessage !== 'Polling cancelled') {
        toast.error(errorMessage);
      }

      stopFakeProgress();
      setViewState('videodemo');
      setTaskCreated(false); // 重置任务创建状态
    } finally {
      setIsGenerating(false);
      setAbortController(null); // 清理 AbortController
      // 不在这里重置progress，让结果状态保持
    }
  };

  return (
    <div className="container mx-auto px-4 pb-16">
      <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
        {/* Left Side - Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8">
            {/* Tab Navigation */}
            <div className="flex mb-6">
              <button
                onClick={() => setTabMode('image-to-video')}
                className={cn(
                  "flex-1 py-3 px-2 sm:px-4 rounded-l-lg border-2 transition-all duration-200 font-medium text-xs sm:text-sm",
                  tabMode === 'image-to-video'
                    ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                )}
              >
                <span className="hidden sm:inline">Image To Video</span>
                <span className="sm:hidden">Image</span>
              </button>
              <button
                onClick={() => setTabMode('video-to-video')}
                className={cn(
                  "flex-1 py-3 px-2 sm:px-4 rounded-r-lg border-2 border-l-0 transition-all duration-200 font-medium text-xs sm:text-sm",
                  tabMode === 'video-to-video'
                    ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25"
                    : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                )}
              >
                <span className="hidden sm:inline">Video To Video</span>
                <span className="sm:hidden">Video</span>
              </button>
            </div>

            {/* Image/Video Upload */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-white font-medium">
                  {tabMode === 'image-to-video' ? 'Upload Image' : 'Upload Video'} <span className="text-red-500">*</span>
                </label>
                {tabMode === 'image-to-video' && selectedImage && (
                  <button
                    onClick={() => setIsMaskModalOpen(true)}
                    className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 text-primary hover:text-primary/90 text-sm font-medium rounded-lg transition-all duration-200"
                    title="Optional mask image to specify the person in the image to animate."
                  >
                    Select Speaker
                  </button>
                )}
              </div>
              <div className="relative">
                {tabMode === 'image-to-video' ? (
                  // Image Upload
                  selectedImage ? (
                    <div className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                      <Image
                        src={imageUrl!}
                        alt="Selected image"
                        width={400}
                        height={300}
                        className="w-full h-48 object-contain"
                        unoptimized
                      />
                      {maskImageData && (
                        <div className="absolute inset-0 pointer-events-none">
                          <Image
                            src={maskImageData}
                            alt="Mask overlay"
                            width={400}
                            height={300}
                            className="w-full h-48 object-contain opacity-50"
                            unoptimized
                          />
                        </div>
                      )}
                      <button
                        onClick={removeSelectedImage}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {maskImageData && (
                        <button
                          onClick={removeMask}
                          className="absolute top-2 right-12 bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-full transition-colors"
                          title="Remove mask"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => checkAuthAndProceed(() => imageInputRef.current?.click())}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver('image');
                      }}
                      onDragLeave={() => setIsDragOver(null)}
                      onDrop={handleImageDrop}
                      className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragOver === 'image'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                        }`}
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span>{isDragOver === 'image' ? 'Drop image here' : 'click and drop upload image'}</span>
                      <span className="text-sm">PNG, JPG up to 10MB</span>
                    </div>
                  )
                ) : (
                  // Video Upload
                  selectedVideo ? (
                    <div className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                      <video
                        src={URL.createObjectURL(selectedVideo)}
                        className="w-full h-48 object-contain"
                        controls
                        muted
                      />
                      <button
                        onClick={removeSelectedVideo}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => checkAuthAndProceed(() => videoInputRef.current?.click())}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver('video');
                      }}
                      onDragLeave={() => setIsDragOver(null)}
                      onDrop={handleVideoDrop}
                      className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors cursor-pointer ${isDragOver === 'video'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                        }`}
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span>{isDragOver === 'video' ? 'Drop video here' : 'click and drop upload video'}</span>
                      <span className="text-sm">MP4, MOV up to 100MB</span>
                    </div>
                  )
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Audio Upload */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-white font-medium">Upload Audio <span className="text-red-500">*</span></label>
                <div>
                  {/* Hidden audio element for robust preview */}
                  <audio ref={previewAudioRef} className="hidden" controls preload="auto">
                    {previewAudioUrl ? (
                      <>
                        <source src={previewAudioUrl} type={selectedAudio?.type || ''} />
                        <source src={previewAudioUrl} type="audio/mpeg" />
                        <source src={previewAudioUrl} type="audio/mp4" />
                      </>
                    ) : null}
                  </audio>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-3">Supported formats: mp3, wav, m4a, ogg, flac</p>
              <p className="text-slate-500 text-xs mb-3">
                Need to edit your audio or extract audio from video?{' '}
                <Link href="/audio-tools" className="text-primary hover:text-primary/80 underline">
                  Use our Audio Tools
                </Link>
              </p>
              <div className="relative">
                {selectedAudio ? (
                  <div className="relative bg-slate-800/50 rounded-lg border border-slate-600 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center min-w-0 flex-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            checkAuthAndProceed(() => previewSelectedAudio());
                          }}
                          className="text-primary hover:text-primary/80 p-1 mr-2 flex-shrink-0"
                          disabled={!selectedAudio}
                        >
                          {isPreviewPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </button>
                        <FileAudio className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-white truncate" title={selectedAudio.name}>{selectedAudio.name}</span>
                        {audioDuration > 0 && (
                          <span className="text-slate-400 ml-2 flex-shrink-0">({audioDuration}s)</span>
                        )}
                      </div>
                      <button
                        onClick={removeSelectedAudio}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => checkAuthAndProceed(() => audioInputRef.current?.click())}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver('audio');
                    }}
                    onDragLeave={() => setIsDragOver(null)}
                    onDrop={handleAudioDrop}
                    className={`w-full p-4 border rounded-lg text-left transition-colors cursor-pointer ${isDragOver === 'audio'
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={isDragOver === 'audio' ? 'text-primary' : 'text-slate-400'}>
                        {isDragOver === 'audio' ? 'Drop audio file here' : 'click and drop select audio file'}
                      </span>
                      <FileAudio className={`w-5 h-5 ${isDragOver === 'audio' ? 'text-primary' : 'text-slate-500'}`} />
                    </div>
                  </div>
                )}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.flac"
                  onChange={handleAudioUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Resolution Selection */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">Resolution <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setResolution('480p')}
                  className={cn(
                    "py-3 px-2 rounded-lg border-2 transition-all duration-200 font-medium",
                    resolution === '480p'
                      ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                  )}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold">480P</div>
                    <div className="text-xs opacity-60">1 Credit/sec</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('720p')}
                  className={cn(
                    "py-3 px-2 rounded-lg border-2 transition-all duration-200 font-medium",
                    resolution === '720p'
                      ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                  )}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold">720P</div>
                    <div className="text-xs opacity-60">2 Credits/sec</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setResolution('1080p')}
                  className={cn(
                    "py-3 px-2 rounded-lg border-2 transition-all duration-200 font-medium",
                    resolution === '1080p'
                      ? "border-primary bg-primary/20 text-primary shadow-lg shadow-primary/25"
                      : "border-slate-600 bg-slate-800/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700/50"
                  )}
                >
                  <div className="text-center">
                    <div className="text-sm font-bold">1080P</div>
                    <div className="text-xs opacity-60">3 Credits/sec</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-white font-medium mb-3">Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want the character to express or do... (Optional)"
                className="w-full h-24 bg-slate-800/50 border-slate-600 text-white placeholder-slate-400 resize-none"
              />
            </div>

            {/* Generate Button */}
            <div className="relative">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white py-3 font-semibold disabled:opacity-50"
              >
                {isGenerating ? 'Generating...' : 'Generate Video'}
              </Button>
              {/* Credit cost label */}
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                {audioDuration > 0 ? `${calculateCredits()} Credits` :
                  `${resolution === '480p' ? '5' : resolution === '720p' ? '10' : '15'} Credits`}
              </div>
            </div>

            {/* InfiniteTalk Multi CTA */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl">
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">Want Multi-Character Conversations?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Create realistic dialogues with multiple speakers using Infinite Talk Multi AI
                </p>
                <Link href="/infinitetalk-multi">
                  <Button variant="outline" className="w-full border-primary/30 bg-transparent hover:bg-primary/10 text-primary hover:text-primary font-semibold">
                    Try Infinite Talk Multi AI
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Preview/Result */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 lg:h-fit">
          <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Preview</h2>

            <div className="relative">
              {/* Video Demo State */}
              {viewState === 'videodemo' && (
                <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                  <video
                    ref={demoVideoRef}
                    src="https://cfsource.infinitetalk.net/infinitetalk/mp4/demo.mp4"
                    controls
                    muted
                    preload="metadata"
                    className="w-full h-full object-cover"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}

              {/* Loading State */}
              {viewState === 'loading' && (
                <div className="aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h3 className="text-white text-xl font-semibold mb-4">Generating Video...</h3>
                  <div className="w-full max-w-md">
                    <Progress value={progress} className="w-full mb-2" />
                    <p className="text-slate-400 text-sm text-center">{Math.round(progress)}% complete</p>
                  </div>
                  {taskCreated && (
                    <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                      <p className="text-slate-300 text-sm text-center">
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

              {/* Result State */}
              {viewState === 'result' && resultVideoUrl && (
                <div className="relative">
                  <div className="aspect-video bg-slate-800 rounded-lg overflow-hidden">
                    <video
                      ref={resultVideoRef}
                      src={resultVideoUrl}
                      controls
                      muted
                      preload="metadata"
                      className="w-full h-full"
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                  <button
                    onClick={() => downloadMediaWithCors(resultVideoUrl, `infinitetalk-${Date.now()}.mp4`, toast.showToast)}
                    className="absolute top-2 right-2 bg-black/50 hover:bg-primary p-2 rounded-full text-white transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
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

      {/* Select Speaker Mask Modal */}
      <Dialog open={isMaskModalOpen} onOpenChange={setIsMaskModalOpen}>
        <DialogContent className="max-w-[98vw] mx-auto w-[98vw] sm:max-w-[700px] sm:w-auto max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Select Speaker</DialogTitle>
          </DialogHeader>
          <div className="py-3 sm:py-6 px-2 sm:px-0">
            {selectedImage && (
              <div className="space-y-4">
                {/* Combined Image and Canvas */}
                <div className="relative bg-slate-800 rounded-lg overflow-hidden border border-slate-600">
                  {/* Background Image */}
                  <Image
                    src={imageUrl!}
                    alt="Original image"
                    width={1200}
                    height={800}
                    className="w-full h-[300px] sm:h-[500px] object-contain"
                    unoptimized
                  />

                  {/* Canvas overlay for drawing mask */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-[300px] sm:h-[500px] cursor-none"
                    onMouseDown={startDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={(e) => {
                      e.preventDefault();
                      if (isDrawing) {
                        draw(e);
                      }
                    }}
                    style={{ imageRendering: 'pixelated', touchAction: 'none' }}
                  />

                  {/* Mouse cursor circle */}
                  {mousePosition && (
                    <div
                      className="absolute pointer-events-none border-2 border-white rounded-full opacity-70"
                      style={{
                        left: 0,
                        top: 0,
                        width: brushSize,
                        height: brushSize,
                        transform: `translate(${mousePosition.x - brushSize / 2}px, ${mousePosition.y - brushSize / 2}px)`,
                      }}
                    />
                  )}
                </div>

                {/* Controls */}
                <div className="bg-slate-700/50 rounded-lg p-3 sm:p-6">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden space-y-4">
                    {/* Brush Size Control */}
                    <div className="flex items-center justify-between">
                      <label className="text-white text-sm font-medium">Brush Size:</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-white text-sm w-8">{brushSize}px</span>
                      </div>
                    </div>

                    {/* Undo/Redo Buttons */}
                    <div className="flex items-center justify-center space-x-4">
                      <button
                        onClick={undoCanvas}
                        disabled={historyIndex <= 0}
                        className="p-2 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Undo"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={redoCanvas}
                        disabled={historyIndex >= canvasHistory.length - 1}
                        className="p-2 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Redo"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                        </svg>
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={handleCancelMask}
                        className="flex-1 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUseMask}
                        className="flex-1 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Use Mask
                      </button>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-3">
                        <label className="text-white text-sm font-medium w-20">Brush Size:</label>
                        <input
                          type="range"
                          min="5"
                          max="50"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number(e.target.value))}
                          className="w-32"
                        />
                        <span className="text-white text-sm w-10">{brushSize}px</span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={undoCanvas}
                          disabled={historyIndex <= 0}
                          className="p-2 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Undo"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        </button>
                        <button
                          onClick={redoCanvas}
                          disabled={historyIndex >= canvasHistory.length - 1}
                          className="p-2 rounded-lg bg-slate-600 hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Redo"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <button
                        onClick={handleCancelMask}
                        className="w-20 py-2 ml-2 bg-slate-600 hover:bg-slate-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUseMask}
                        className="py-2 w-25 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Use Mask
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-center text-slate-400 text-sm">
                  <p>Draw on the image to create a mask. </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
