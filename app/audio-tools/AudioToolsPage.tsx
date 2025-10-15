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
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [ffmpeg, setFfmpeg] = useState<any | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMultiAudioModalOpen, setIsMultiAudioModalOpen] = useState(false);

  // UI uses ceiled total duration for tick/labels
  const effectiveDuration = useMemo(() => Math.ceil(duration || 0), [duration]);
  const getClampedEndForDisplay = useCallback(() => {
    return Math.min(effectiveDuration, Math.ceil(selectionEnd));
  }, [effectiveDuration, selectionEnd]);

  const getBaseName = (filename: string): string => {
    const idx = filename.lastIndexOf('.')
    return idx > 0 ? filename.slice(0, idx) : filename;
  };

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
    } catch {}
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
      } catch {}
    }
    // Attach to DOM for iOS Safari to reliably fire loadedmetadata
    mediaEl.style.position = 'fixed';
    mediaEl.style.left = '-99999px';
    mediaEl.style.top = '0';
    mediaEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(mediaEl);

    let timeoutId: number | null = null;
    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null as any;
      }
      try { document.body.removeChild(mediaEl); } catch {}
      URL.revokeObjectURL(objectUrl);
    };

    const onLoaded = () => {
      const d = Math.max(0, (mediaEl as HTMLMediaElement).duration || 0);
      if (!isFinite(d) || d <= 0) {
        toast.showToast('Failed to read media duration', 'error');
        cleanup();
        return;
      }
      setDuration(d);
      setSelectionStart(0);
      setSelectionEnd(d);
      cleanup();
    };
    const onError = () => {
      toast.showToast('Failed to load media', 'error');
      cleanup();
    };

    mediaEl.addEventListener('loadedmetadata', onLoaded);
    mediaEl.addEventListener('error', onError);
    mediaEl.src = objectUrl;
    try { mediaEl.load(); } catch {}
    // Fallback timeout for platforms that never fire events when off-DOM
    timeoutId = window.setTimeout(() => {
      onError();
    }, 4000);

    return () => {
      mediaEl.removeEventListener('loadedmetadata', onLoaded);
      mediaEl.removeEventListener('error', onError);
      cleanup();
    };
  }, [sourceFile, sourceType, toast]);

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

  // Fake waveform bars
  const bars = useMemo(() => {
    const count = 120; // number of bars
    const rngSeed = 42; // deterministic
    let x = rngSeed;
    const arr: number[] = [];
    for (let i = 0; i < count; i++) {
      // simple LCG to get pseudo random heights
      x = (1664525 * x + 1013904223) % 4294967296;
      const v = (x / 4294967296) * 0.8 + 0.2; // 0.2 - 1.0
      arr.push(v);
    }
    return arr;
  }, []);

  const posToTime = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el || duration <= 0) return 0;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const timeToPercent = useCallback((t: number) => {
    if (duration <= 0) return 0;
    return Math.min(100, Math.max(0, (t / duration) * 100));
  }, [duration]);

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
    if (!duration) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const startPx = timeToPercent(selectionStart) * rect.width / 100;
    const endPx = timeToPercent(selectionEnd) * rect.width / 100;
    const edgeThreshold = 8; // px (mouse)

    const distStart = Math.abs(x - startPx);
    const distEnd = Math.abs(x - endPx);

    // If click very close to both handles (overlap), pick side by half of track
    if (distStart <= edgeThreshold && distEnd <= edgeThreshold) {
      setDraggingEdge(x < rect.width / 2 ? 'start' : 'end');
    } else if (distStart <= edgeThreshold) {
      setDraggingEdge('start');
    } else if (distEnd <= edgeThreshold) {
      setDraggingEdge('end');
    } else if (x > Math.min(startPx, endPx) && x < Math.max(startPx, endPx)) {
      setDraggingEdge('move');
    } else {
      setDraggingEdge(null);
      const t = posToTime(e.clientX);
      const MIN_GAP = Math.min(1, Math.max(0, duration));
      const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      if (duration - (newStart + MIN_GAP) < SNAP_EPS) newStart = Math.max(0, duration - MIN_GAP);
      setSelectionStart(newStart);
    }
    setIsDragging(true);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !duration) return;
    const t = posToTime(e.clientX);
    const MIN_GAP = Math.min(1, Math.max(0, duration));
    const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
    if (draggingEdge === 'start') {
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      setSelectionStart(newStart);
    } else if (draggingEdge === 'end') {
      let newEnd = Math.min(duration, Math.max(t, selectionStart + MIN_GAP));
      if (duration - newEnd < SNAP_EPS) newEnd = duration;
      setSelectionEnd(newEnd);
    } else if (draggingEdge === 'move') {
      // move whole region maintaining length
      const desiredLen = selectionEnd - selectionStart;
      const len = Math.max(MIN_GAP, desiredLen);
      let newStart = t - len / 2;
      newStart = Math.max(0, Math.min(newStart, duration - len));
      if (newStart < SNAP_EPS) newStart = 0;
      if (duration - (newStart + len) < SNAP_EPS) newStart = Math.max(0, duration - len);
      setSelectionStart(newStart);
      setSelectionEnd(newStart + len);
    }
  };

  const onMouseUp = () => {
    setIsDragging(false);
    setDraggingEdge(null);
  };

  // Touch handlers for better mobile experience
  const onTouchStart = (e: React.TouchEvent) => {
    if (!duration) return;
    const el = containerRef.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const touch = e.touches[0]; if (!touch) return;
    const x = touch.clientX - rect.left;
    const startPx = timeToPercent(selectionStart) * rect.width / 100;
    const endPx = timeToPercent(selectionEnd) * rect.width / 100;
    const edgeThreshold = 24; // larger hit area for touch

    const distStart = Math.abs(x - startPx);
    const distEnd = Math.abs(x - endPx);

    if (distStart <= edgeThreshold && distEnd <= edgeThreshold) {
      setDraggingEdge(x < rect.width / 2 ? 'start' : 'end');
    } else if (distStart <= edgeThreshold) {
      setDraggingEdge('start');
    } else if (distEnd <= edgeThreshold) {
      setDraggingEdge('end');
    } else if (x > Math.min(startPx, endPx) && x < Math.max(startPx, endPx)) {
      setDraggingEdge('move');
    } else {
      setDraggingEdge(null);
      const t = posToTime(touch.clientX);
      const MIN_GAP = Math.min(1, Math.max(0, duration));
      const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      if (duration - (newStart + MIN_GAP) < SNAP_EPS) newStart = Math.max(0, duration - MIN_GAP);
      setSelectionStart(newStart);
    }
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !duration) return;
    const touch = e.touches[0]; if (!touch) return;
    const t = posToTime(touch.clientX);
    const MIN_GAP = Math.min(1, Math.max(0, duration));
    const SNAP_EPS = Math.min(0.25, Math.max(0.01, duration / 200));
    if (draggingEdge === 'start') {
      let newStart = Math.max(0, Math.min(t, selectionEnd - MIN_GAP));
      if (newStart < SNAP_EPS) newStart = 0;
      setSelectionStart(newStart);
    } else if (draggingEdge === 'end') {
      let newEnd = Math.min(duration, Math.max(t, selectionStart + MIN_GAP));
      if (duration - newEnd < SNAP_EPS) newEnd = duration;
      setSelectionEnd(newEnd);
    } else if (draggingEdge === 'move') {
      const desiredLen = selectionEnd - selectionStart;
      const len = Math.max(MIN_GAP, desiredLen);
      let newStart = t - len / 2;
      newStart = Math.max(0, Math.min(newStart, duration - len));
      if (newStart < SNAP_EPS) newStart = 0;
      if (duration - (newStart + len) < SNAP_EPS) newStart = Math.max(0, duration - len);
      setSelectionStart(newStart);
      setSelectionEnd(newStart + len);
    }
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    setDraggingEdge(null);
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
      } catch {}
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

  const handlePreviewToggle = useCallback(async () => {
    if (!previewUrl || !duration) return;
    const el = mediaRef.current;
    if (!el) return;
    if (!isPlaying) {
      try {
        el.currentTime = Math.max(0, selectionStart);
        await el.play();
        setIsPlaying(true);
      } catch {
        // ignore
      }
    } else {
      try { el.pause(); } catch { /* no-op */ }
      setIsPlaying(false);
    }
  }, [duration, isPlaying, previewUrl, selectionStart]);

  // Stop at selectionEnd while previewing
  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    const onTimeUpdate = () => {
      if (!isPlaying) return;
      if (el.currentTime >= Math.min(duration, selectionEnd)) {
        try { el.pause(); } catch { /* no-op */ }
        setIsPlaying(false);
      }
    };
    el.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [duration, selectionEnd, isPlaying]);

  const onPickAudio = () => {
    checkAuthAndProceed(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.mp3,.wav,.m4a,.ogg,.flac';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        setSourceType('audio');
        setSourceFile(file);
      };
      input.click();
    });
  };

  const onPickVideo = () => {
    checkAuthAndProceed(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) return;
        // basic validation
        const ok = file.type.startsWith('video/');
        if (!ok) {
          toast.showToast('Please select a valid video file', 'error');
          return;
        }
        // iOS Safari sometimes needs a microtask delay to populate file metadata
        Promise.resolve().then(() => {
          setSourceType('video');
          setSourceFile(file);
        });
      };
      input.click();
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Header */}
        <div className="mb-12">
          {/* Back to Home - Left aligned */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-all duration-200 bg-slate-800/40 hover:bg-slate-700/60 px-4 py-2.5 rounded-xl border border-slate-600/40 hover:border-slate-500/60 hover:shadow-lg hover:shadow-blue-500/10 group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium">Back to Home</span>
            </Link>
          </div>
          
          {/* Title and description - Centered */}
          <div className="text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
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
                onClick={onPickAudio} 
                disabled={isExporting}
                variant="outline"
                className="h-12 px-6 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Audio
              </Button>
              <Button 
                type="button" 
                onClick={onPickVideo} 
                disabled={isExporting}
                variant="outline"
                className="h-12 px-6 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
              >
                <Upload className="w-4 h-4 mr-2" /> Extract From Video
              </Button>
            </div>

            {/* Info */}
            {sourceFile && (
              <div className="bg-slate-700/30 rounded-xl p-4 mb-8 border border-slate-600/30">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  <div className="text-sm text-slate-300">
                    <span className="font-medium">Selected:</span> {sourceFile.name} {effectiveDuration > 0 && `( ${formatSeconds(effectiveDuration)} )`}
                  </div>
                </div>
              </div>
            )}

            {/* Fake waveform with selection */}
            <div
              ref={containerRef}
              className="relative w-full h-36 bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-600/50 overflow-hidden select-none mb-8 shadow-inner"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
            >
              {/* bars */}
              <div className="absolute inset-0 flex items-center px-4 gap-[2px] z-10">
                {bars.map((h, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-blue-400/80 to-blue-300/60 rounded-full shadow-sm"
                    style={{ height: `${Math.floor(h * 75)}%` }}
                  />
                ))}
              </div>
              {/* selection overlay */}
              {duration > 0 && (
                <>
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-x-2 border-blue-400 z-20 rounded-sm"
                    style={{ left: `${timeToPercent(selectionStart)}%`, width: `${timeToPercent(selectionEnd) - timeToPercent(selectionStart)}%` }}
                  />
                  {/* Start/End handles */}
                  <div
                    className="absolute top-0 bottom-0 w-3 sm:w-2 bg-gradient-to-b from-blue-400 to-blue-600 cursor-ew-resize z-30 -translate-x-1/2 rounded-full shadow-lg border border-blue-300"
                    style={{ left: `${timeToPercent(selectionStart)}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-3 sm:w-2 bg-gradient-to-b from-blue-400 to-blue-600 cursor-ew-resize z-30 -translate-x-1/2 rounded-full shadow-lg border border-blue-300"
                    style={{ left: `${timeToPercent(selectionEnd)}%` }}
                  />
                  {/* ticks */}
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
                  {/* timeline */}
                  <div className="absolute bottom-1 left-2 right-2 flex justify-between text-xs text-white/70 z-50">
                    <span>{formatSeconds(selectionStart)}</span>
                    <span>{formatSeconds(getClampedEndForDisplay())}</span>
                  </div>
                </>
              )}
            </div>

            {/* Selection times */}
            <div className="flex items-center justify-between text-sm text-slate-300 mb-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="font-medium">Start:</span> {formatSeconds(selectionStart)}
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                <span className="font-medium">End:</span> {formatSeconds(getClampedEndForDisplay())}
              </div>
            </div>

            <div className="text-sm text-slate-400 mb-8 text-center bg-slate-700/20 rounded-xl p-4 border border-slate-600/20">
              🎵 Drag to select a range. If you do not trim, click Export to use the full audio.
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
                disabled={!previewUrl || duration <= 0}
                variant="outline"
                className="h-12 px-6 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
              >
                {isPlaying ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Play Selection</>}
              </Button>
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  if (duration > 0) {
                    setSelectionStart(0);
                    setSelectionEnd(duration);
                  }
                }}
                disabled={duration <= 0}
                variant="outline"
                className="h-12 px-6 bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
              >
                Select All
              </Button>
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-full px-4 py-2 border border-slate-600/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-slate-300">
                  Preview selection ({formatSeconds(Math.max(0, Math.ceil(selectionEnd - selectionStart)))})
                </span>
              </div>
            </div>
            
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
              
              {/* Use in WAN2.2 S2V */}
              <Button 
                type="button" 
                onClick={() => handleNavigateWithAudio('/wan2.2-s2v')}
                disabled={!sourceFile || isExporting}
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">Processing</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Use in WAN2.2 S2V</span>
                    <span className="sm:hidden">WAN2.2 S2V</span>
                  </>
                )}
              </Button>
              
              {/* Use in InfiniteTalk Multi */}
              <Button 
                type="button" 
                onClick={() => handleNavigateWithAudioMulti('/infinitetalk-multi')}
                disabled={!sourceFile || isExporting}
                className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-medium transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <>
                    <div className="w-3 h-3 lg:w-4 lg:h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Processing...</span>
                    <span className="sm:hidden">Processing</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Use in InfiniteTalk Multi</span>
                    <span className="sm:hidden">Multi</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Features Description */}
        <div className="mt-16 max-w-8xl mx-auto">
          <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
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
