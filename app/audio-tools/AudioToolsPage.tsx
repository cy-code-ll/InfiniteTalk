'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast-provider';
import { Upload, Play, Pause, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth, useClerk } from '@clerk/nextjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SourceType = 'audio' | 'video' | null;

// Helper: format seconds to mm:ss (always ceil as requested)
function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// Helper: format seconds to mm:ss format for manual input
function formatSecondsToMMSS(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

// Helper: parse mm:ss format to seconds
function parseTimeToSeconds(timeString: string): number {
  const parts = timeString.split(':');
  if (parts.length !== 2) return 0;

  const minutes = parseInt(parts[0], 10) || 0;
  const seconds = parseInt(parts[1], 10) || 0;

  return minutes * 60 + seconds;
}

export default function AudioToolsPage() {
  const toast = useToast();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggingEdge, setDraggingEdge] = useState<'start' | 'end' | 'move' | null>(null);
  const [hasMoved, setHasMoved] = useState<boolean>(false);
  const [initialClickTime, setInitialClickTime] = useState<number>(0);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [ffmpeg, setFfmpeg] = useState<any | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMultiAudioModalOpen, setIsMultiAudioModalOpen] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [manualStartTime, setManualStartTime] = useState<string>('00:00');
  const [manualEndTime, setManualEndTime] = useState<string>('00:00');
  const [isManualInput, setIsManualInput] = useState<boolean>(false);
  const [hasAudioTrack, setHasAudioTrack] = useState<boolean>(true); // 新增：跟踪是否有音频轨道
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // UI uses ceiled total duration for tick/labels
  const effectiveDuration = useMemo(() => Math.max(0, duration || 0), [duration]);
  const getClampedEndForDisplay = useCallback(() => {
    return Math.min(effectiveDuration, Math.ceil(selectionEnd));
  }, [effectiveDuration, selectionEnd]);

  const getBaseName = (filename: string): string => {
    const idx = filename.lastIndexOf('.')
    return idx > 0 ? filename.slice(0, idx) : filename;
  };

  // 生成音频波纹图数据
  const generateWaveformData = useCallback(async (audioBuffer: AudioBuffer): Promise<number[]> => {
    const data = audioBuffer.getChannelData(0); // 使用左声道
    const samples = 1500; // 波纹图采样点数
    const blockSize = Math.floor(data.length / samples);
    const waveform: number[] = [];

    for (let i = 0; i < samples; i++) {
      let sum = 0;
      const start = i * blockSize;
      const end = Math.min(start + blockSize, data.length);

      for (let j = start; j < end; j++) {
        sum += Math.abs(data[j]);
      }

      const average = sum / (end - start);
      waveform.push(average);
    }

    return waveform;
  }, []);

  // 使用Web Audio API分析音频
  const analyzeAudio = useCallback(async (file: File): Promise<void> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const waveform = await generateWaveformData(audioBuffer);
      setWaveformData(waveform);
      setHasAudioTrack(true); // 成功解码，有音频轨道

      audioContext.close();
    } catch (error) {
      console.error('Failed to analyze audio:', error);

      // 如果是视频文件且没有音频，生成空的波纹图
      if (sourceType === 'video') {
        const emptyWaveform = new Array(1500).fill(0);
        setWaveformData(emptyWaveform);
        setHasAudioTrack(false); // 没有音频轨道
        toast.showToast('Video has no audio track - empty waveform generated', 'info');
      } else {
        setHasAudioTrack(false); // 音频文件解码失败
        toast.showToast('Failed to analyze audio file', 'error');
      }
      throw new Error('Failed to analyze audio');
    }
  }, [generateWaveformData, toast, sourceType]);



  // 绘制波纹图
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const centerY = height / 2;
    const barWidth = width / waveformData.length;
    const maxHeight = height;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制背景
    ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
    ctx.fillRect(0, 0, width, height);

    // 绘制波纹条
    waveformData.forEach((value, index) => {
      const barHeight = Math.max(1, value * maxHeight); // 确保最小高度为1像素
      const x = index * barWidth;
      const y = centerY - barHeight / 2;

      // 创建渐变
      const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
      gradient.addColorStop(0, '#00FF8E'); // 绿色顶部
      gradient.addColorStop(1, '#00CC70'); // 绿色底部

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, Math.max(1, barWidth - 1), barHeight);
    });

    // 绘制选择区域
    if (effectiveDuration > 0) {
      const startPercent = (selectionStart / effectiveDuration) * 100;
      const endPercent = (selectionEnd / effectiveDuration) * 100;
      const startX = (startPercent / 100) * width;
      const endX = (endPercent / 100) * width;

      // 选择区域背景
      ctx.fillStyle = 'rgba(0, 255, 142, 0.3)';
      ctx.fillRect(startX, 0, endX - startX, height);

      // 选择区域边框
      ctx.strokeStyle = '#00FF8E';
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, 0, endX - startX, height);
    }

    // 绘制播放进度
    if (effectiveDuration > 0 && currentTime >= 0) {
      const progressPercent = (currentTime / effectiveDuration) * 100;
      const progressX = (progressPercent / 100) * width;

      // 播放进度线
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(progressX, 0);
      ctx.lineTo(progressX, height);
      ctx.stroke();

      // 播放进度时间标签背景
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(progressX - 25, 5, 50, 20);

      // 播放进度时间标签
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(formatSeconds(currentTime), progressX, 18);
    }
  }, [waveformData, effectiveDuration, selectionStart, selectionEnd, currentTime]);

  // 当波纹图数据或选择区域变化时重新绘制
  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // 窗口大小变化时重新绘制
  useEffect(() => {
    const handleResize = () => {
      drawWaveform();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawWaveform]);

  // 检查登录状态
  const checkAuthAndProceed = (callback: () => void) => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    callback();
  };

  const triggerDownload = (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch { }
  };

  // When source file set, probe duration from metadata (iOS-safe)
  useEffect(() => {
    if (!sourceFile) return;

    const objectUrl = URL.createObjectURL(sourceFile);
    const mediaEl: HTMLMediaElement = sourceType === 'video' ? document.createElement('video') : document.createElement('audio');
    mediaEl.preload = 'metadata';
    if (sourceType === 'video') {
      try {
        (mediaEl as HTMLVideoElement).muted = true; // iOS allows autoplay/metadata fetch when muted
        (mediaEl as HTMLVideoElement).playsInline = true;
      } catch { }
    }
    // Attach to DOM for iOS Safari to reliably fire loadedmetadata
    mediaEl.style.position = 'fixed';
    mediaEl.style.left = '-99999px';
    mediaEl.style.top = '0';
    mediaEl.controls = true
    mediaEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(mediaEl);

    let timeoutId: number | null = null;
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null as any;
      }
      try { mediaEl.parentElement?.removeChild(mediaEl); } catch (e) { console.log('清理失败', e) }
      URL.revokeObjectURL(objectUrl);

    };

    const onLoaded = async () => {
      const d = Math.max(0, (mediaEl as HTMLMediaElement).duration || 0);
      if (!isFinite(d) || d <= 0) {
        toast.showToast('Failed to read media duration', 'error');
        cleanup();
        return;
      }
      setDuration(d);
      setSelectionStart(0);
      setSelectionEnd(d);
      setCurrentTime(0); // 初始化播放进度

      // 生成波形：音频直接解码；视频（多数容器/编码）也能被解码为 AudioBuffer，若失败可后续再做抽音
      if (sourceType === 'audio' || sourceType === 'video') {
        try {
          await analyzeAudio(sourceFile);
        } catch {
          // ignore; 若需要可在此添加基于 ffmpeg 的抽音备选方案
          cleanup()
          setSourceFile(null);
          return;
        }
      }

      cleanup();
    };
    const onError = () => {
      toast.showToast('Failed to load media', 'error');
      cleanup();
    };

    mediaEl.addEventListener('loadedmetadata', onLoaded);
    mediaEl.addEventListener('error', onError);
    mediaEl.src = objectUrl;
    try { mediaEl.load(); } catch { }
    // Fallback timeout for platforms that never fire events when off-DOM
    timeoutId = window.setTimeout(() => {
      onError();
    }, 4000);

    return () => {
      mediaEl.removeEventListener('loadedmetadata', onLoaded);
      mediaEl.removeEventListener('error', onError);
      cleanup();
    };
  }, [sourceFile, sourceType, toast, analyzeAudio]);

  // Manage preview object URL lifecycle
  useEffect(() => {
    if (!sourceFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(sourceFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sourceFile]);

  // Reset audio track state when source file changes
  useEffect(() => {
    if (sourceFile) {
      setHasAudioTrack(true); // 重置为默认值，等待 analyzeAudio 结果
    }
  }, [sourceFile]);

  // Stop playing when selection/source changes
  useEffect(() => {
    if (mediaRef.current) {
      try { mediaRef.current.pause(); } catch { /* no-op */ }
      setIsPlaying(false);
    }
  }, [selectionStart, selectionEnd, sourceType]);

  // Derived: is selection full length
  const isFullSelection = useMemo(() => {
    return duration > 0 && selectionStart <= 0 && Math.abs(selectionEnd - duration) < 0.01;
  }, [duration, selectionStart, selectionEnd]);


  const posToTime = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el || effectiveDuration <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * effectiveDuration;
  }, [effectiveDuration]);

  const timeToPercent = useCallback((t: number) => {
    if (effectiveDuration <= 0) return 0;
    return Math.min(100, Math.max(0, (t / effectiveDuration) * 100));
  }, [effectiveDuration]);

  // Tick step chooser to keep <= ~20 ticks
  const tickStep = useMemo(() => {
    if (effectiveDuration <= 0) return 1;
    const candidates = [1, 2, 5, 10, 15, 30, 60];
    for (const c of candidates) {
      if (effectiveDuration / c <= 20) return c;
    }
    return 120;
  }, [effectiveDuration]);

  const ticks = useMemo(() => {
    if (effectiveDuration <= 0) return [] as { sec: number; percent: number }[];
    const result: { sec: number; percent: number }[] = [];
    const count = Math.floor(effectiveDuration / tickStep);
    for (let i = 0; i <= count; i++) {
      const sec = i * tickStep;
      const percent = (sec / effectiveDuration) * 100;
      result.push({ sec, percent });
    }
    return result;
  }, [effectiveDuration, tickStep]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!effectiveDuration) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const startPx = timeToPercent(selectionStart) * rect.width / 100;
    const endPx = timeToPercent(selectionEnd) * rect.width / 100;
    const edgeThreshold = 8; // px (mouse)

    const distStart = Math.abs(x - startPx);
    const distEnd = Math.abs(x - endPx);

    // 记录初始点击时间和位置
    const clickTime = posToTime(e.clientX);
    setInitialClickTime(clickTime);
    setHasMoved(false);

    // If click very close to both handles (overlap), pick side by half of track
    if (distStart <= edgeThreshold && distEnd <= edgeThreshold) {
      setDraggingEdge(x < rect.width / 2 ? 'start' : 'end');
    } else if (distStart <= edgeThreshold) {
      setDraggingEdge('start');
    } else if (distEnd <= edgeThreshold) {
      setDraggingEdge('end');
    } else if (x > Math.min(startPx, endPx) && x < Math.max(startPx, endPx)) {
      setDraggingEdge('move');
      // 计算鼠标在裁剪区域内的相对位置偏移量
      setDragOffset(clickTime - selectionStart);
    } else {
      setDraggingEdge(null);
      // 不在这里设置播放位置，等到鼠标抬起时再设置
    }
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !effectiveDuration) return;
    const t = posToTime(e.clientX);

    const MIN_GAP = Math.min(1, Math.max(0, effectiveDuration));
    const SNAP_EPS = Math.min(0.25, Math.max(0.01, effectiveDuration / 200));

    // 标记发生了移动
    setHasMoved(true);

    if (draggingEdge === 'start') {
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      setSelectionStart(newStart);
    } else if (draggingEdge === 'end') {
      let newEnd = Math.min(effectiveDuration, Math.max(t, selectionStart + MIN_GAP));
      if (effectiveDuration - newEnd < SNAP_EPS) newEnd = effectiveDuration;
      setSelectionEnd(newEnd);
    } else if (draggingEdge === 'move') {
      // move whole region maintaining length and relative position
      const desiredLen = selectionEnd - selectionStart;
      const len = Math.max(MIN_GAP, desiredLen);
      // 使用偏移量来保持鼠标在裁剪区域内的相对位置
      let newStart = t - dragOffset;
      newStart = Math.max(0, Math.min(newStart, effectiveDuration - len));
      if (newStart < SNAP_EPS) newStart = 0;
      if (effectiveDuration - (newStart + len) < SNAP_EPS) newStart = Math.max(0, effectiveDuration - len);
      setSelectionStart(newStart);
      setSelectionEnd(newStart + len);
    }
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!effectiveDuration || !isDragging) return;
    const el = containerRef.current;
    if (!el) return;
    const t = posToTime(e.clientX);


    // 如果拖拽了操作符，检查当前播放进度是否在裁剪区域外
    if (draggingEdge !== null && mediaRef.current) {
      // 只有当播放进度超出裁剪区域范围时才调整
      if (currentTime < selectionStart) {
        // 播放进度在裁剪区域左边，调整到开始边界
        mediaRef.current.currentTime = selectionStart;
        setCurrentTime(selectionStart);
      } else if (currentTime > selectionEnd) {
        // 播放进度在裁剪区域右边，调整到结束边界
        mediaRef.current.currentTime = selectionEnd;
        setCurrentTime(selectionEnd);
      }
      // 如果播放进度在裁剪区域范围内 (selectionStart <= currentTime <= selectionEnd)，则不执行任何操作
    }

    // 点击在选择区域内，定位播放位置
    if (!hasMoved && mediaRef.current) {
      mediaRef.current.currentTime = t;
      setCurrentTime(t);
    }
    setIsDragging(false);
    setDraggingEdge(null);
    setHasMoved(false);
  };

  // Touch handlers for better mobile experience
  const onTouchStart = (e: React.TouchEvent) => {
    if (!effectiveDuration) return;
    const el = containerRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const touch = e.touches[0]; if (!touch) return;
    const x = touch.clientX - rect.left;
    const startPx = timeToPercent(selectionStart) * rect.width / 100;
    const endPx = timeToPercent(selectionEnd) * rect.width / 100;
    const edgeThreshold = 24; // larger hit area for touch

    const distStart = Math.abs(x - startPx);
    const distEnd = Math.abs(x - endPx);

    // 记录初始触摸时间和位置
    const touchTime = posToTime(touch.clientX);
    setInitialClickTime(touchTime);
    setHasMoved(false);

    if (distStart <= edgeThreshold && distEnd <= edgeThreshold) {
      setDraggingEdge(x < rect.width / 2 ? 'start' : 'end');
    } else if (distStart <= edgeThreshold) {
      setDraggingEdge('start');
    } else if (distEnd <= edgeThreshold) {
      setDraggingEdge('end');
    } else if (x > Math.min(startPx, endPx) && x < Math.max(startPx, endPx)) {
      setDraggingEdge('move');
      // 计算触摸在裁剪区域内的相对位置偏移量
      setDragOffset(touchTime - selectionStart);
    } else {
      setDraggingEdge(null);
      // 不在这里设置播放位置，等到触摸结束时再设置
    }
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !effectiveDuration) return;
    const touch = e.touches[0]; if (!touch) return;
    const t = posToTime(touch.clientX);
    const MIN_GAP = Math.min(1, Math.max(0, effectiveDuration));
    const SNAP_EPS = Math.min(0.25, Math.max(0.01, effectiveDuration / 200));

    // 标记发生了移动
    setHasMoved(true);

    if (draggingEdge === 'start') {
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      setSelectionStart(newStart);
    } else if (draggingEdge === 'end') {
      let newEnd = Math.min(effectiveDuration, Math.max(t, selectionStart + MIN_GAP));
      if (effectiveDuration - newEnd < SNAP_EPS) newEnd = effectiveDuration;
      setSelectionEnd(newEnd);
    } else if (draggingEdge === 'move') {
      // move whole region maintaining length and relative position
      const desiredLen = selectionEnd - selectionStart;
      const len = Math.max(MIN_GAP, desiredLen);
      // 使用偏移量来保持触摸在裁剪区域内的相对位置
      let newStart = t - dragOffset;
      newStart = Math.max(0, Math.min(newStart, effectiveDuration - len));
      if (newStart < SNAP_EPS) newStart = 0;
      if (effectiveDuration - (newStart + len) < SNAP_EPS) newStart = Math.max(0, effectiveDuration - len);
      setSelectionStart(newStart);
      setSelectionEnd(newStart + len);
    }
  };

  const onTouchEnd = () => {
    console.log(111)
    // 如果没有拖拽操作符，且没有发生移动，则设置播放位置
    if (draggingEdge === null && !hasMoved && mediaRef.current) {
      mediaRef.current.currentTime = initialClickTime;
      setCurrentTime(initialClickTime);
    }

    // 如果拖拽了操作符，检查当前播放进度是否在裁剪区域外
    if (draggingEdge !== null && mediaRef.current) {
      // 只有当播放进度超出裁剪区域范围时才调整
      if (currentTime < selectionStart) {
        // 播放进度在裁剪区域左边，调整到开始边界
        mediaRef.current.currentTime = selectionStart;
        setCurrentTime(selectionStart);
      } else if (currentTime > selectionEnd) {
        // 播放进度在裁剪区域右边，调整到结束边界
        mediaRef.current.currentTime = selectionEnd;
        setCurrentTime(selectionEnd);
      }
      // 如果播放进度在裁剪区域范围内 (selectionStart <= currentTime <= selectionEnd)，则不执行任何操作
    }

    setIsDragging(false);
    setDraggingEdge(null);
    setHasMoved(false);
  };

  // Canvas点击处理函数
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!effectiveDuration) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const t = posToTime(e.clientX);

    // 智能操作符定位逻辑
    if (t < selectionStart) {
      // 点击在左边操作符左边，移动左边操作符到点击位置
      const MIN_GAP = Math.min(1, Math.max(0, duration));
      const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      if (effectiveDuration - (newStart + MIN_GAP) < SNAP_EPS) newStart = Math.max(0, effectiveDuration - MIN_GAP);
      setSelectionStart(newStart);
    } else if (t > selectionEnd) {
      // 点击在右边操作符右边，移动右边操作符到点击位置
      const MIN_GAP = Math.min(1, Math.max(0, duration));
      const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
      let newEnd = Math.min(effectiveDuration, Math.max(t, selectionStart + MIN_GAP));
      if (effectiveDuration - newEnd < SNAP_EPS) newEnd = effectiveDuration;
      setSelectionEnd(newEnd);
    } else {
      // 点击在选择区域内，定位播放位置
      // if (mediaRef.current) {
      //   mediaRef.current.currentTime = t;
      //   setCurrentTime(t);
      // }
    }
  };

  const handleCanvasTouch = (e: React.TouchEvent) => {
    if (!effectiveDuration) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    const t = posToTime(touch.clientX);

    // 智能操作符定位逻辑
    if (t < selectionStart) {
      // 点击在左边操作符左边，移动左边操作符到点击位置
      const MIN_GAP = Math.min(1, Math.max(0, duration));
      const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      if (effectiveDuration - (newStart + MIN_GAP) < SNAP_EPS) newStart = Math.max(0, effectiveDuration - MIN_GAP);
      setSelectionStart(newStart);
    } else if (t > selectionEnd) {
      // 点击在右边操作符右边，移动右边操作符到点击位置
      const MIN_GAP = Math.min(1, Math.max(0, duration));
      const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
      let newEnd = Math.min(effectiveDuration, Math.max(t, selectionStart + MIN_GAP));
      if (effectiveDuration - newEnd < SNAP_EPS) newEnd = effectiveDuration;
      setSelectionEnd(newEnd);
    } else {
      // 点击在选择区域内，定位播放位置
      if (mediaRef.current) {
        mediaRef.current.currentTime = t;
        setCurrentTime(t);
      }
    }
  };

  const ensureFfmpeg = useCallback(async () => {
    if (ffmpeg && ffmpegLoaded) return ffmpeg;

    // Dynamic import FFmpeg only when needed
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const instance = ffmpeg ?? new FFmpeg();
    setFfmpeg(instance);
    if (!ffmpegLoaded) {
      await instance.load();
      // Optional: pipe logs to console to help diagnose zero-byte outputs
      try {
        (instance as any).on?.('log', (e: any) => {
          if (e?.message) console.log('[FFmpeg]', e.message);
        });
        (instance as any).on?.('progress', (p: any) => {
          // console.log('[FFmpeg][progress]', p);
        });
      } catch { }
      setFfmpegLoaded(true);
    }
    return instance;
  }, [ffmpeg, ffmpegLoaded]);

  // Process audio and return the processed file
  const processAudio = useCallback(async (): Promise<File | null> => {
    if (!sourceFile || !sourceType || duration <= 0) {
      toast.showToast('Please select a media file first', 'info');
      return null;
    }

    try {
      // If no trimming and type is audio: return original quickly
      if (sourceType === 'audio' && isFullSelection) {
        return sourceFile;
      }

      const ff = await ensureFfmpeg();
      const { fetchFile } = await import('@ffmpeg/util');

      const inName = sourceType === 'video' ? 'input.mp4' : 'input.audio';
      await ff.writeFile(inName, await fetchFile(sourceFile));

      // Build cut args with decimals and ensure end > start
      const safeStart = Math.max(0, selectionStart);
      const safeEnd = Math.max(safeStart + 0.1, selectionEnd);
      const startStr = safeStart.toFixed(2);
      const durStr = (safeEnd - safeStart).toFixed(2);
      const argsBase = ['-i', inName];
      const argsCutInputSide = isFullSelection ? [] : ['-ss', startStr];
      const argsCutOutputSide = isFullSelection ? [] : ['-t', durStr];

      // Prefer container for copy based on source mime
      const preferMp3 = sourceType === 'audio' && /mpeg|mp3/i.test(sourceFile.type || '');

      // Try fast copy to m4a
      let outName = preferMp3 ? 'output.mp3' : 'output.m4a';
      try {
        const cmd = ['-y', ...argsCutInputSide, ...argsBase, '-vn', ...argsCutOutputSide, '-acodec', 'copy', outName];
        console.log('[FFmpeg] exec', cmd.join(' '));
        await ff.exec(cmd);
        const data = await ff.readFile(outName);
        const bytes = data as unknown as Uint8Array;
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const mime = preferMp3 ? 'audio/mpeg' : 'audio/mp4';
        const ext = preferMp3 ? 'mp3' : 'm4a';
        const blob = new Blob([buf], { type: mime });
        if (blob.size === 0) throw new Error('Empty copy output');
        const base = sourceFile ? getBaseName(sourceFile.name) : `audio-${Date.now()}`;
        const file = new File([blob], `${base}.${ext}`, { type: mime });
        console.log(`[AudioTools] processed .${ext}`, { name: file.name, size: file.size, type: file.type, start: selectionStart, end: selectionEnd });
        return file;
      } catch (e) {
        // fallback
      }

      // Fallback: re-encode to mp3
      outName = 'output.mp3';
      const cmd2 = ['-y', ...argsCutInputSide, ...argsBase, ...argsCutOutputSide, '-c:a', 'mp3', '-b:a', '192k', outName];
      console.log('[FFmpeg] exec', cmd2.join(' '));
      await ff.exec(cmd2);
      const data2 = await ff.readFile(outName);
      const bytes2 = data2 as unknown as Uint8Array;
      const buf2 = bytes2.buffer.slice(bytes2.byteOffset, bytes2.byteOffset + bytes2.byteLength) as ArrayBuffer;
      const blob2 = new Blob([buf2], { type: 'audio/mpeg' });
      if (blob2.size === 0) throw new Error('Empty mp3 output');
      const base2 = sourceFile ? getBaseName(sourceFile.name) : `audio-${Date.now()}`;
      const file2 = new File([blob2], `${base2}.mp3`, { type: 'audio/mpeg' });
      console.log(`[AudioTools] processed .mp3`, { name: file2.name, size: file2.size, type: file2.type, start: selectionStart, end: selectionEnd });
      return file2;
    } catch (error) {
      console.error(error);
      toast.showToast('Audio processing failed', 'error');
      return null;
    }
  }, [duration, ensureFfmpeg, isFullSelection, selectionEnd, selectionStart, sourceFile, sourceType, toast]);

  // Handle navigation with audio data
  const handleNavigateWithAudio = useCallback(async (path: string) => {
    checkAuthAndProceed(async () => {
      if (!sourceFile) {
        toast.showToast('Please select a media file first', 'info');
        return;
      }

      try {
        setIsExporting(true);
        toast.showToast('Processing audio, please wait...', 'info');

        const processedFile = await processAudio();

        if (processedFile) {
          toast.showToast('Audio processed successfully! Redirecting...', 'success');

          // Store the processed audio file in sessionStorage for the target page to pick up
          const reader = new FileReader();
          reader.onload = () => {
            const audioData = {
              name: processedFile.name,
              type: processedFile.type,
              size: processedFile.size,
              data: reader.result
            };
            sessionStorage.setItem('audioToolsProcessedAudio', JSON.stringify(audioData));

            // Small delay to let user see the success message
            setTimeout(() => {
              window.location.href = path;
            }, 1000);
          };
          reader.readAsDataURL(processedFile);
        }
      } catch (error) {
        console.error('Failed to process audio for navigation:', error);
        toast.showToast('Failed to process audio', 'error');
      } finally {
        setIsExporting(false);
      }
    });
  }, [sourceFile, processAudio, toast, checkAuthAndProceed]);

  // Handle navigation with audio data for Multi
  const handleNavigateWithAudioMulti = useCallback(async (path: string) => {
    checkAuthAndProceed(() => {
      if (!sourceFile) {
        toast.showToast('Please select a media file first', 'info');
        return;
      }

      // Open modal to let user choose left or right audio
      setIsMultiAudioModalOpen(true);
    });
  }, [sourceFile, toast, checkAuthAndProceed]);

  // Handle Multi audio selection
  const handleMultiAudioSelection = useCallback(async (audioType: 'left' | 'right') => {
    checkAuthAndProceed(async () => {
      if (!sourceFile) {
        toast.showToast('Please select a media file first', 'info');
        return;
      }

      try {
        setIsExporting(true);
        setIsMultiAudioModalOpen(false);
        toast.showToast('Processing audio, please wait...', 'info');

        const processedFile = await processAudio();

        if (processedFile) {
          toast.showToast('Audio processed successfully! Redirecting...', 'success');

          // Store the processed audio file in sessionStorage for the target page to pick up
          const reader = new FileReader();
          reader.onload = () => {
            const audioData = {
              name: processedFile.name,
              type: processedFile.type,
              size: processedFile.size,
              data: reader.result,
              audioType: audioType // Add audio type (left or right)
            };
            sessionStorage.setItem('audioToolsProcessedAudioMulti', JSON.stringify(audioData));

            // Small delay to let user see the success message
            setTimeout(() => {
              window.location.href = '/infinitetalk-multi';
            }, 1000);
          };
          reader.readAsDataURL(processedFile);
        }
      } catch (error) {
        console.error('Failed to process audio for Multi navigation:', error);
        toast.showToast('Failed to process audio', 'error');
      } finally {
        setIsExporting(false);
      }
    });
  }, [sourceFile, processAudio, toast, checkAuthAndProceed]);

  const handleExport = useCallback(async () => {
    if (!sourceFile || !sourceType || duration <= 0) {
      toast.showToast('Please select a media file first', 'info');
      return;
    }

    try {
      setIsExporting(true);

      // If no trimming and type is audio: return original quickly
      if (sourceType === 'audio' && isFullSelection) {
        triggerDownload(sourceFile);
        setIsExporting(false);
        return;
      }

      const ff = await ensureFfmpeg();
      const { fetchFile } = await import('@ffmpeg/util');

      const inName = sourceType === 'video' ? 'input.mp4' : 'input.audio';
      await ff.writeFile(inName, await fetchFile(sourceFile));

      // Build cut args with decimals and ensure end > start
      const safeStart = Math.max(0, selectionStart);
      const safeEnd = Math.max(safeStart + 0.1, selectionEnd);
      const startStr = safeStart.toFixed(2);
      const durStr = (safeEnd - safeStart).toFixed(2);
      const argsBase = ['-i', inName];
      const argsCutInputSide = isFullSelection ? [] : ['-ss', startStr];
      const argsCutOutputSide = isFullSelection ? [] : ['-t', durStr];

      // Prefer container for copy based on source mime
      const preferMp3 = sourceType === 'audio' && /mpeg|mp3/i.test(sourceFile.type || '');

      // Try fast copy to m4a
      let outName = preferMp3 ? 'output.mp3' : 'output.m4a';
      try {
        const cmd = ['-y', ...argsCutInputSide, ...argsBase, '-vn', ...argsCutOutputSide, '-acodec', 'copy', outName];
        console.log('[FFmpeg] exec', cmd.join(' '));
        await ff.exec(cmd);
        const data = await ff.readFile(outName);
        const bytes = data as unknown as Uint8Array;
        const buf = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
        const mime = preferMp3 ? 'audio/mpeg' : 'audio/mp4';
        const ext = preferMp3 ? 'mp3' : 'm4a';
        const blob = new Blob([buf], { type: mime });
        if (blob.size === 0) throw new Error('Empty copy output');
        const base = sourceFile ? getBaseName(sourceFile.name) : `audio-${Date.now()}`;
        const file = new File([blob], `${base}.${ext}`, { type: mime });
        console.log(`[AudioTools] exported .${ext}`, { name: file.name, size: file.size, type: file.type, start: selectionStart, end: selectionEnd });
        triggerDownload(file);
        setIsExporting(false);
        return;
      } catch (e) {
        // fallback
      }

      // Fallback: re-encode to mp3
      outName = 'output.mp3';
      const cmd2 = ['-y', ...argsCutInputSide, ...argsBase, ...argsCutOutputSide, '-c:a', 'mp3', '-b:a', '192k', outName];
      console.log('[FFmpeg] exec', cmd2.join(' '));
      await ff.exec(cmd2);
      const data2 = await ff.readFile(outName);
      const bytes2 = data2 as unknown as Uint8Array;
      const buf2 = bytes2.buffer.slice(bytes2.byteOffset, bytes2.byteOffset + bytes2.byteLength) as ArrayBuffer;
      const blob2 = new Blob([buf2], { type: 'audio/mpeg' });
      if (blob2.size === 0) throw new Error('Empty mp3 output');
      const base2 = sourceFile ? getBaseName(sourceFile.name) : `audio-${Date.now()}`;
      const file2 = new File([blob2], `${base2}.mp3`, { type: 'audio/mpeg' });
      console.log('[AudioTools] exported .mp3', { name: file2.name, size: file2.size, type: file2.type, start: selectionStart, end: selectionEnd });
      triggerDownload(file2);
    } catch (error) {
      console.error(error);
      toast.showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [duration, ensureFfmpeg, isFullSelection, selectionEnd, selectionStart, sourceFile, sourceType, toast]);

  // 手动时间输入处理函数
  const handleManualTimeChange = (value: string, type: 'start' | 'end') => {
    setIsManualInput(true);
    if (type === 'start') {
      setManualStartTime(value);
    } else {
      setManualEndTime(value);
    }
  };

  const handleManualTimeBlur = (type: 'start' | 'end') => {
    setIsManualInput(false);
    if (type === 'start') {
      const seconds = parseTimeToSeconds(manualStartTime);
      const clampedSeconds = Math.max(0, Math.min(seconds, selectionEnd - 1));
      setSelectionStart(clampedSeconds);
      setManualStartTime(formatSecondsToMMSS(clampedSeconds));
    } else {
      const seconds = parseTimeToSeconds(manualEndTime);
      const clampedSeconds = Math.max(selectionStart + 1, Math.min(seconds, effectiveDuration));
      setSelectionEnd(clampedSeconds);
      setManualEndTime(formatSecondsToMMSS(clampedSeconds));
    }
  };

  const adjustTime = (type: 'start' | 'end', delta: number) => {
    setIsManualInput(true);
    if (type === 'start') {
      const currentSeconds = parseTimeToSeconds(manualStartTime);
      const newSeconds = Math.max(0, Math.min(currentSeconds + delta, selectionEnd - 1));
      setManualStartTime(formatSecondsToMMSS(newSeconds));
      setSelectionStart(newSeconds);
    } else {
      const currentSeconds = parseTimeToSeconds(manualEndTime);
      const newSeconds = Math.max(selectionStart + 1, Math.min(currentSeconds + delta, effectiveDuration));
      setManualEndTime(formatSecondsToMMSS(newSeconds));
      setSelectionEnd(newSeconds);
    }
    setTimeout(() => setIsManualInput(false), 100);
  };

  const handlePreviewToggle = useCallback(async () => {
    if (!previewUrl || !effectiveDuration) return;
    const el = mediaRef.current;
    if (!el) return;

    // 如果没有音频轨道，显示提示并返回
    if (!hasAudioTrack) {
      toast.showToast('Cannot play: no audio track in this video', 'info');
      return;
    }

    if (!isPlaying) {
      try {
        // 从当前进度条位置开始播放
        let startTime = currentTime;

        // 如果当前进度在右边操作符位置，则从左边操作符位置开始播放
        if (Math.abs(currentTime - selectionEnd) < 0.1) {
          startTime = selectionStart;
        }

        // 确保开始时间在选择区域内
        startTime = Math.max(selectionStart, Math.min(startTime, selectionEnd));

        el.currentTime = startTime;
        setCurrentTime(startTime);

        await el.play();
        setIsPlaying(true);
      } catch (err) {
        console.log('Play failed:', err);
        setIsPlaying(false);
        // 如果播放失败，重置状态但不重试播放
      }
    } else {
      try { el.pause(); } catch { /* no-op */ }
      setIsPlaying(false);
    }
  }, [effectiveDuration, isPlaying, previewUrl, currentTime, selectionStart, selectionEnd, hasAudioTrack, toast]);

  // 键盘事件监听 - 空格键播放/暂停
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了空格键
      if (e.code === 'Space' || e.key === ' ') {
        // 防止页面滚动
        e.preventDefault();

        // 只有在有音频文件且不在拖拽状态时才响应
        if (previewUrl && effectiveDuration > 0 && !isDragging) {
          handlePreviewToggle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewUrl, effectiveDuration, isDragging, handlePreviewToggle]);

  // Stop at selectionEnd while previewing and update current time
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const onTimeUpdate = () => {
      // 只有在有音频轨道时才更新播放进度
      if (hasAudioTrack) {
        setCurrentTime(el.currentTime);
      }
      if (!isPlaying) return;
      // 当播放到选择区域结束时停止播放
      if (el.currentTime >= selectionEnd) {
        try { el.pause(); } catch { /* no-op */ }
        setIsPlaying(false);
        // 确保播放进度显示在选择区域结束位置
        setCurrentTime(selectionEnd);
      }
    };
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [effectiveDuration, selectionEnd, isPlaying, hasAudioTrack]);

  // 同步手动输入与选择区域
  useEffect(() => {
    if (!isManualInput && effectiveDuration > 0) {
      setManualStartTime(formatSecondsToMMSS(selectionStart));
      setManualEndTime(formatSecondsToMMSS(selectionEnd));
    }
  }, [selectionStart, selectionEnd, effectiveDuration, isManualInput]);

  const onPickMedia = () => {
    checkAuthAndProceed(() => {
      const input = document.createElement('input');
      input.type = 'file';
      // allow both audio and video
      input.accept = '.mp3,.wav,.m4a,.ogg,.flac,video/*,audio/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;

        // choose logic by mime
        if (file.type.startsWith('video/')) {
          // video branch
          Promise.resolve().then(() => {
            setSourceType('video');
            setSourceFile(file);
          });
        } else if (file.type.startsWith('audio/') || /\.(mp3|wav|m4a|ogg|flac)$/i.test(file.name)) {
          // audio branch (fallback to extension check)
          setSourceType('audio');
          setSourceFile(file);
        } else {
          toast.showToast('Please select a valid audio or video file', 'error');
        }
      };
      input.click();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Header */}
        <div className="mb-12">
          {/* Back to Previous Page - Left aligned */}
          <div className="mb-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-200 bg-slate-800/40 hover:bg-slate-700/60 px-4 py-2.5 rounded-xl border border-slate-600/40 hover:border-slate-500/60 hover:shadow-lg hover:shadow-blue-500/10 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          {/* Title and description - Centered */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                Infinite Talk AI Audio Tools
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Professional audio editing tools. Cut, trim, and edit audio files with precision.
                Extract audio from video files seamlessly.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-slate-800/80 to-slate-900/80 rounded-3xl border border-slate-700/50 backdrop-blur-xl p-8 shadow-2xl">

            {/* Top controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
              <Button
                type="button"
                onClick={onPickMedia}
                disabled={isExporting}
                variant="outline"
                className="h-12 px-6 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Media
              </Button>
            </div>

            {/* 文件名称显示 */}
            {sourceFile && (
              <div className="text-center mb-4">
                <div className="inline-block bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-600/30">
                  <span className="text-slate-300 font-medium">{sourceFile.name}</span>
                </div>
              </div>
            )}

            {/* Canvas 波纹图容器 */}
            {sourceFile && (<div className="relative mb-8">
              <div
                ref={containerRef}
                className="relative w-full h-36 bg-gradient-to-b from-slate-800/60 to-slate-900/60  border-slate-600/50 overflow-hidden select-none shadow-inner"
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onTouchCancel={onTouchEnd}
              >
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
                  style={{ imageRendering: 'pixelated' }}
                  onMouseDown={handleCanvasClick}
                  onTouchStart={handleCanvasTouch}
                />

                {/* 选择区域操作手柄 */}
                {effectiveDuration > 0 && (
                  <>
                    {/* 开始时间手柄 */}
                    <div
                      className="absolute top-0 bottom-0 w-3 sm:w-2 bg-gradient-to-b from-blue-400 to-blue-600 cursor-ew-resize z-30 -translate-x-1/2 rounded-full shadow-lg border border-blue-300 flex flex-col items-center justify-center"
                      style={{ left: `${timeToPercent(selectionStart)}%` }}
                    >
                      {/* 操作符圆点 */}
                      <div className="flex flex-col gap-0.5">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>


                    {/* 结束时间手柄 */}
                    <div
                      className="absolute top-0 bottom-0 w-3 sm:w-2 bg-gradient-to-b from-blue-400 to-blue-600 cursor-ew-resize z-30 -translate-x-1/2 rounded-full shadow-lg border border-blue-300 flex flex-col items-center justify-center"
                      style={{ left: `${timeToPercent(selectionEnd)}%` }}

                    >
                      {/* 操作符圆点 */}
                      <div className="flex flex-col gap-0.5">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>


                    {/* 时间刻度 */}
                    <div className="absolute left-0 right-0 bottom-0 h-8 pointer-events-none z-40">
                      {ticks.map((t, i) => {
                        const isFirst = i === 0;
                        const isLast = i === ticks.length - 1;
                        const translateClass = isFirst ? '' : isLast ? 'translate-x-[-100%]' : 'translate-x-[-50%]';
                        const textAlign = isFirst ? 'text-left' : isLast ? 'text-right' : 'text-center';
                        return (
                          <div key={i} className={`absolute bottom-0 ${translateClass}`} style={{ left: `${t.percent}%` }}>
                            <div className="w-px bg-white/50" style={{ height: i % 2 === 0 ? '16px' : '10px' }} />
                            {i % 2 === 0 && (
                              <div className={`text-[10px] text-white/70 mt-0.5 ${textAlign}`} style={{ width: isFirst || isLast ? '24px' : 'auto' }}>
                                {t.sec}s
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* 时间标签 - 在容器外部 */}
              {effectiveDuration > 0 && (
                <>
                  {/* 开始时间标签 */}
                  <div
                    className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-40 -translate-x-1/2"
                    style={{
                      left: `${timeToPercent(selectionStart)}%`,
                      top: '100%',
                      marginTop: '8px'
                    }}
                  >
                    {formatSeconds(selectionStart)}
                  </div>

                  {/* 结束时间标签 */}
                  <div
                    className="absolute bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-40 -translate-x-1/2"
                    style={{
                      left: `${timeToPercent(selectionEnd)}%`,
                      top: '100%',
                      marginTop: '8px'
                    }}
                  >
                    {formatSeconds(selectionEnd)}
                  </div>
                </>
              )}
            </div>)}


            {/* 裁剪后时长显示 */}
            {effectiveDuration > 0 && (
              <div className="text-center mb-6">
                <div className="inline-block bg-slate-700/50 rounded-lg px-4 py-2 border border-slate-600/30">
                  <span className="text-slate-300 font-medium">
                    duration: {formatSeconds(Math.max(0, Math.floor(selectionEnd - selectionStart)))}
                  </span>
                </div>
              </div>
            )}


            <div className="text-sm text-slate-400 mb-8 text-center bg-slate-700/20 rounded-xl p-4 border border-slate-600/20">
              🎵 Drag to select a range. If you do not trim, click Export to use the full audio.
              <br />
              <span className="text-slate-500 text-xs mt-1 block">
                💡 Press <kbd className="bg-slate-600 px-1 py-0.5 rounded text-xs">Space</kbd> to play/pause
              </span>
            </div>

            {/* Play + Select All + Preview in one row */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              {sourceType === 'audio' ? (
                <audio
                  ref={(el) => { mediaRef.current = el as unknown as HTMLMediaElement; }}
                  src={previewUrl ?? undefined}
                  preload="metadata"
                  className="hidden"
                />
              ) : (
                <video
                  ref={(el) => { mediaRef.current = el as unknown as HTMLMediaElement; }}
                  src={previewUrl ?? undefined}
                  preload="metadata"
                  className="hidden"
                />
              )}

              <Button
                type="button"
                size="lg"
                onClick={handlePreviewToggle}
                disabled={!previewUrl || effectiveDuration <= 0 || !hasAudioTrack}
                variant="outline"
                className="h-12 w-30 px-6 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
              >
                {isPlaying ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Play</>}
              </Button>

              {/* 手动时间输入框 */}
              {sourceFile && effectiveDuration > 0 && (
                <div className="flex items-center gap-2">
                  {/* 开始时间输入框 */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={manualStartTime}
                        onChange={(e) => handleManualTimeChange(e.target.value, 'start')}
                        onBlur={() => handleManualTimeBlur('start')}
                        className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                        placeholder="00:00"
                      />
                      <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center">
                        <button
                          type="button"
                          onClick={() => adjustTime('start', 1)}
                          className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustTime('start', -1)}
                          className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>-</div>

                  {/* 结束时间输入框 */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={manualEndTime}
                        onChange={(e) => handleManualTimeChange(e.target.value, 'end')}
                        onBlur={() => handleManualTimeBlur('end')}
                        className="w-20 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                        placeholder="00:00"
                      />
                      <div className="absolute right-1 top-0 bottom-0 flex flex-col justify-center">
                        <button
                          type="button"
                          onClick={() => adjustTime('end', 1)}
                          className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustTime('end', -1)}
                          className="w-4 h-3 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 lg:flex lg:flex-wrap lg:justify-center gap-3 lg:gap-4">
                <Button
                  type="button"
                  onClick={handleExport}
                  disabled={!sourceFile || isExporting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 lg:px-8 lg:py-3 text-sm lg:text-base font-medium transition-colors disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Exporting...</span>
                      <span className="sm:hidden">Exporting</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Export Audio</span>
                      <span className="sm:hidden">Export</span>
                    </>
                  )}
                </Button>

                {/* Use in InfiniteTalk */}
                <Button
                  type="button"
                  onClick={() => handleNavigateWithAudio('/infinitetalk')}
                  disabled={!sourceFile || isExporting}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium transition-colors disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 lg:mr-2" />
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Processing</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Use in InfiniteTalk</span>
                      <span className="sm:hidden">InfiniteTalk</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Description */}
        <div className="mt-16 max-w-8xl mx-auto">
          <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-8">
            <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Audio Tools Features
            </h2>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column */}
              <div className="flex-1 space-y-6">
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-600/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Upload className="w-4 h-4 text-blue-400" />
                    </div>
                    File Upload & Processing
                  </h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Audio Files:</strong> Upload MP3, WAV, M4A, OGG, FLAC formats</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Video Files:</strong> Extract audio from any video format</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Drag & Drop:</strong> Visual waveform display for precise selection</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-600/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-green-400" />
                    </div>
                    Audio Editing Features
                  </h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Precise Cutting:</strong> Drag handles to select exact start/end points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Preview:</strong> Play selected portion before processing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Select All:</strong> Quick button to use entire audio</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column */}
              <div className="flex-1 space-y-6">
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-600/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Download className="w-4 h-4 text-purple-400" />
                    </div>
                    Export Formats
                  </h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>MP3:</strong> High-quality audio with 192kbps bitrate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>M4A:</strong> Fast copy mode for original quality</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Auto Format:</strong> Optimized based on source file type</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-600/30">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <ArrowLeft className="w-4 h-4 text-orange-400" />
                    </div>
                    Direct Integration
                  </h3>
                  <ul className="space-y-3 text-slate-300">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>InfiniteTalk:</strong> Single character video generation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>WAN2.2 S2V:</strong> Image-to-video with audio</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <span><strong>Multi Mode:</strong> Choose Left/Right audio for conversations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Button Actions */}
            <div className="mt-8 bg-slate-800/40 rounded-xl p-6 border border-slate-600/30">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Button Actions</h3>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Download className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Export Audio</h4>
                  <p className="text-sm text-slate-400">Download processed audio file to your device</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 font-bold">IT</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Use in InfiniteTalk</h4>
                  <p className="text-sm text-slate-400">Directly use audio in single character video generation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-emerald-400 font-bold">S2V</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Use in WAN2.2 S2V</h4>
                  <p className="text-sm text-slate-400">Use audio for image-to-video generation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-400 font-bold">M</span>
                  </div>
                  <h4 className="font-semibold text-white mb-2">Use in Multi</h4>
                  <p className="text-sm text-slate-400">Choose Left/Right position for multi-character videos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Multi Audio Selection Modal */}
      <Dialog open={isMultiAudioModalOpen} onOpenChange={setIsMultiAudioModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Select Audio Position</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Choose Audio Position
            </h3>
            <p className="text-muted-foreground mb-6">
              Select whether this audio should be used as Left Audio or Right Audio in InfiniteTalk Multi.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleMultiAudioSelection('left')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3"
              >
                Left Audio
              </Button>
              <Button
                onClick={() => handleMultiAudioSelection('right')}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3"
              >
                Right Audio
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsMultiAudioModalOpen(false)}
              className="mt-4 w-full"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
