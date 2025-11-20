'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { Upload, Play, Pause, Download, Loader2, X, HelpCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '../ui/toast-provider';
import { useAuth } from '@clerk/nextjs';
import { useAuthModal } from '@/components/auth/auth-modal-provider';
import { useUserInfo } from '@/lib/providers';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import Link from 'next/link';
import { saveToIndexedDB, getFromIndexedDB, deleteFromIndexedDB } from '@/lib/indexedDB';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { isMobileDevice } from '@/lib/utils';
import { shareToSocial } from '@/lib/share-utils';

interface GenerationState {
  status: 'demo' | 'loading' | 'result';
  progress: number;
  videoUrl?: string;
  taskId?: string;
}

export default function MultiHero() {
  // IndexedDB 缓存键名
  const CACHE_KEY = 'infinitetalk-multi-form-cache';
  const SESSION_KEY = 'infinitetalk-multi-session-active';

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
  const { openAuthModal } = useAuthModal();
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
      // 推迟到下一帧，缩短当前输入任务，降低 INP
      requestAnimationFrame(() => openAuthModal('signin'));
      return;
    }
    callback();
  };

  // 💾 保存表单到 IndexedDB
  const saveFormCache = async () => {
    try {
      await saveToIndexedDB(CACHE_KEY, {
        // 文件
        imageFile: imageFile,
        leftAudioFile: leftAudioFile,
        rightAudioFile: rightAudioFile,
        
        // 表单数据
        prompt: prompt,
        order: order,
        resolution: resolution,
        leftAudioDuration: leftAudioDuration,
        rightAudioDuration: rightAudioDuration,
      });
      console.log('✅ Multi form cached to IndexedDB');
    } catch (error) {
      console.error('❌ Failed to cache multi form:', error);
    }
  };

  // 🗑️ 清除缓存
  const clearFormCache = async () => {
    try {
      await deleteFromIndexedDB(CACHE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      console.log('✅ Multi cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear multi cache:', error);
    }
  };

  // 📥 恢复缓存数据
  const restoreFormCache = async () => {
    try {
      // 1️⃣ 检查是否是同一会话
      const isActiveSession = sessionStorage.getItem(SESSION_KEY);
      
      if (!isActiveSession) {
        // 新会话，清除旧缓存
        console.log('🆕 New session detected, clearing old multi cache...');
        await deleteFromIndexedDB(CACHE_KEY);
        // 设置会话标记
        sessionStorage.setItem(SESSION_KEY, 'true');
        return;
      }

      // 2️⃣ 检查是否有 AudioTools 返回的音频
      const audioToolsData = sessionStorage.getItem('audioToolsProcessedAudioMulti');
      const hasNewAudio = !!audioToolsData;

      // 3️⃣ 从 IndexedDB 恢复数据
      const cache = await getFromIndexedDB(CACHE_KEY);

      if (cache) {
        console.log('📥 Restoring multi form data from cache...');

        // 恢复文件
        if (cache.imageFile) {
          setImageFile(cache.imageFile);
          console.log('✅ Image restored');
        }

        // 恢复音频 - 只有在没有新音频时才恢复
        if (!hasNewAudio) {
          if (cache.leftAudioFile) {
            setLeftAudioFile(cache.leftAudioFile);
            setLeftAudioDuration(cache.leftAudioDuration || 0);
            console.log('✅ Left audio restored from cache');
          }
          
          if (cache.rightAudioFile) {
            setRightAudioFile(cache.rightAudioFile);
            setRightAudioDuration(cache.rightAudioDuration || 0);
            console.log('✅ Right audio restored from cache');
          }
        }

        // 恢复表单数据
        if (cache.prompt) setPrompt(cache.prompt);
        if (cache.order) setOrder(cache.order);
        if (cache.resolution) setResolution(cache.resolution);

        toast.showToast('Form data restored!', 'success');
      }

      // 4️⃣ 处理 AudioTools 返回的新音频（这会在下面的 useEffect 中执行）

    } catch (error) {
      console.error('❌ Failed to restore multi cache:', error);
    }
  };

  // 📤 跳转 AudioTools 前保存
  const handleAudioToolsClick = () => {
    console.log('💾 Saving multi form before navigating to AudioTools...');
    saveFormCache();
  };

  // 使用 AudioContext.decodeAudioData 校验音频文件是否损坏
  const validateAudioFile = useCallback(async (file: File): Promise<{ isValid: boolean; duration?: number; error?: string }> => {
    try {
      // 读取文件为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();

      // 创建 AudioContext
      const audioContext = new AudioContext();

      try {
        // 尝试解码音频数据
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        // 解码成功，获取时长
        const duration = audioBuffer.duration;

        // 清理资源
        await audioContext.close();

        return {
          isValid: true,
          duration: Math.ceil(duration)
        };
      } catch (decodeError) {
        // 解码失败，文件可能损坏
        await audioContext.close();

        const errorMessage = 'Audio file is corrupted';
        return {
          isValid: false,
          error: errorMessage
        };
      }
    } catch (readError) {
      // 文件读取失败
      return {
        isValid: false,
        error: 'Failed to read file'
      };
    }
  }, []);

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
        
        // 使用 AudioContext.decodeAudioData 校验文件
        const validation = await validateAudioFile(file);

        if (!validation.isValid) {
          toast.error(validation.error || 'Audio file is corrupted or invalid');
          return;
        }

        // 校验通过，设置文件
        setLeftAudioFile(file);
        if (validation.duration) {
          setLeftAudioDuration(validation.duration);
        } else {
          // 如果 decodeAudioData 没有返回时长，使用 Audio 对象作为备用
          const duration = await getAudioDuration(file);
          setLeftAudioDuration(duration);
        }
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
        
        // 使用 AudioContext.decodeAudioData 校验文件
        const validation = await validateAudioFile(file);

        if (!validation.isValid) {
          toast.error(validation.error || 'Audio file is corrupted or invalid');
          return;
        }

        // 校验通过，设置文件
        setLeftAudioFile(file);
        if (validation.duration) {
          setLeftAudioDuration(validation.duration);
        } else {
          // 如果 decodeAudioData 没有返回时长，使用 Audio 对象作为备用
          const duration = await getAudioDuration(file);
          setLeftAudioDuration(duration);
        }
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
        
        // 使用 AudioContext.decodeAudioData 校验文件
        const validation = await validateAudioFile(file);

        if (!validation.isValid) {
          toast.error(validation.error || 'Audio file is corrupted or invalid');
          return;
        }

        // 校验通过，设置文件
        setRightAudioFile(file);
        if (validation.duration) {
          setRightAudioDuration(validation.duration);
        } else {
          // 如果 decodeAudioData 没有返回时长，使用 Audio 对象作为备用
          const duration = await getAudioDuration(file);
          setRightAudioDuration(duration);
        }
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
        
        // 使用 AudioContext.decodeAudioData 校验文件
        const validation = await validateAudioFile(file);

        if (!validation.isValid) {
          toast.error(validation.error || 'Audio file is corrupted or invalid');
          return;
        }

        // 校验通过，设置文件
        setRightAudioFile(file);
        if (validation.duration) {
          setRightAudioDuration(validation.duration);
        } else {
          // 如果 decodeAudioData 没有返回时长，使用 Audio 对象作为备用
          const duration = await getAudioDuration(file);
          setRightAudioDuration(duration);
        }
      }
    });
  };

  // 📥 页面加载时恢复缓存数据
  useEffect(() => {
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

  // 从 AudioTools 页面接收处理后的音频 (Multi)
  useEffect(() => {
    const checkForAudioFromToolsMulti = async () => {
      try {
        const audioDataStr = sessionStorage.getItem('audioToolsProcessedAudioMulti');
        if (audioDataStr) {
          const audioData = JSON.parse(audioDataStr);
          
          // 将 base64 数据转换为 File 对象
          try {
            const res = await fetch(audioData.data);
            const blob = await res.blob();
            const file = new File([blob], audioData.name, { type: audioData.type });

            // 使用 AudioContext.decodeAudioData 校验文件
            const validation = await validateAudioFile(file);

            if (!validation.isValid) {
              console.error('Audio from AudioTools Multi is invalid:', validation.error);
              toast.error('Audio file from Audio Tools is corrupted or invalid');
              sessionStorage.removeItem('audioToolsProcessedAudioMulti');
              return;
            }

            // 校验通过，根据 audioType 设置到对应的音频位置
            if (audioData.audioType === 'left') {
              setLeftAudioFile(file);
              if (validation.duration) {
                setLeftAudioDuration(validation.duration);
              } else {
                const duration = await getAudioDuration(file);
                setLeftAudioDuration(duration);
              }
              toast.showToast('Left audio loaded from Audio Tools', 'success');
            } else if (audioData.audioType === 'right') {
              setRightAudioFile(file);
              if (validation.duration) {
                setRightAudioDuration(validation.duration);
              } else {
                const duration = await getAudioDuration(file);
                setRightAudioDuration(duration);
              }
              toast.showToast('Right audio loaded from Audio Tools', 'success');
            }
          } catch (error) {
            console.error('Failed to load audio from AudioTools Multi:', error);
            toast.showToast('Failed to load audio from Audio Tools', 'error');
          }
          
          // 清除 sessionStorage 中的数据
          sessionStorage.removeItem('audioToolsProcessedAudioMulti');
        }
      } catch (error) {
        console.error('Error processing audio from AudioTools Multi:', error);
      }
    };

    checkForAudioFromToolsMulti();
  }, [toast, validateAudioFile]);

  // 🔄 自动保存（防抖）
  useEffect(() => {
    // 只有在有数据时才保存
    if (!imageFile && !leftAudioFile && !rightAudioFile && !prompt) {
      return;
    }

    const timer = setTimeout(() => {
      saveFormCache();
    }, 2000); // 2秒防抖

    return () => clearTimeout(timer);
  }, [imageFile, leftAudioFile, rightAudioFile, prompt, order, resolution, leftAudioDuration, rightAudioDuration]);

  // 🗑️ 生成成功后清除缓存
  useEffect(() => {
    if (generationState.status === 'result' && generationState.videoUrl) {
      console.log('🎬 Multi generation successful, clearing cache...');
      clearFormCache();
    }
  }, [generationState.status, generationState.videoUrl]);

  // ❌ 关闭标签页或离开页面时清除缓存
  useEffect(() => {
    const handlePageHide = () => {
      console.log('❌ Multi page closing, clearing cache...');
      deleteFromIndexedDB(CACHE_KEY);
      sessionStorage.removeItem(SESSION_KEY);
    };

    const handleBeforeUnload = () => {
      sessionStorage.removeItem(SESSION_KEY);
      console.log('⚠️ Multi session key removed, cache will be cleared on next load');
    };

    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

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
    // CNZZ 事件追踪 - 点击生成按钮
    if (typeof window !== 'undefined' && (window as any)._czc) {
      (window as any)._czc.push(['_trackEvent', '用户操作', '点击生成按钮', '/infinitetalk-multi', '1', '']);
      console.log('✅ CNZZ 事件追踪成功:', {
        事件类别: '用户操作',
        事件动作: '点击生成按钮',
        页面路径: '/infinitetalk-multi',
        完整数据: ['_trackEvent', '用户操作', '点击生成按钮', '/infinitetalk-multi', '1', '']
      });
    } else {
      console.warn('⚠️ CNZZ 未初始化，无法追踪事件');
    }

    // 检查用户是否登录
    if (!isSignedIn) {
      requestAnimationFrame(() => openAuthModal('signin'));
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
      // CNZZ 事件追踪 - 积分不足弹窗出现
      if (typeof window !== 'undefined' && (window as any)._czc) {
        (window as any)._czc.push(['_trackEvent', '系统弹窗', '积分不足弹窗', '/infinitetalk-multi', 1, '']);
        console.log('✅ CNZZ 事件追踪成功: 积分不足弹窗出现');
      }
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
                      {isDragOver === 'image' ? 'Drop image here' : 'click and drop upload or drag & drop image'}
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
          <div className="lg:col-span-3 relative rounded-2xl border backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] lg:sticky lg:top-20 p-4">
            {generationState.status === 'demo' && (
              <div className="aspect-video rounded-lg overflow-hidden relative">
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
              </div>
            )}

            {generationState.status === 'loading' && (
              <div className="aspect-video rounded-lg overflow-hidden relative">
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
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
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
                    (window as any)._czc.push(['_trackEvent', '用户操作', '积分不足-关闭弹窗', '/infinitetalk-multi', 1, '']);
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
                    (window as any)._czc.push(['_trackEvent', '用户操作', '积分不足-购买积分', '/infinitetalk-multi', 1, '']);
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
