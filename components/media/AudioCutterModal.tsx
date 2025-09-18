'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast-provider';
import { Upload, Play, Pause } from 'lucide-react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type SourceType = 'audio' | 'video' | null;

interface AudioCutterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (file: File, durationSeconds: number) => void;
}

// Helper: format seconds to mm:ss (always ceil as requested)
function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function AudioCutterModal({ open, onOpenChange, onConfirm }: AudioCutterModalProps) {
  const toast = useToast();

  const [sourceType, setSourceType] = useState<SourceType>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [selectionStart, setSelectionStart] = useState<number>(0);
  const [selectionEnd, setSelectionEnd] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggingEdge, setDraggingEdge] = useState<'start' | 'end' | 'move' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mediaRef = useRef<HTMLMediaElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // UI uses ceiled total duration for tick/labels
  const effectiveDuration = useMemo(() => Math.ceil(duration || 0), [duration]);
  const getClampedEndForDisplay = useCallback(() => {
    return Math.min(effectiveDuration, Math.ceil(selectionEnd));
  }, [effectiveDuration, selectionEnd]);

  const getBaseName = (filename: string): string => {
    const idx = filename.lastIndexOf('.')
    return idx > 0 ? filename.slice(0, idx) : filename;
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

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setSourceType(null);
      setSourceFile(null);
      setDuration(0);
      setSelectionStart(0);
      setSelectionEnd(0);
      setIsDragging(false);
      setDraggingEdge(null);
      return;
    }
  }, [open]);

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

  // Stop playing on close or when selection/source changes
  useEffect(() => {
    if (!open && mediaRef.current) {
      try { mediaRef.current.pause(); } catch { /* no-op */ }
      setIsPlaying(false);
    }
  }, [open, selectionStart, selectionEnd, sourceType]);

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

  const handleConfirm = useCallback(async () => {
    if (!sourceFile || !sourceType || duration <= 0) {
      toast.showToast('Please select a media file first', 'info');
      return;
    }

    try {
      setIsExporting(true);

      // If no trimming and type is audio: return original quickly
      if (sourceType === 'audio' && isFullSelection) {
        onConfirm(sourceFile, duration);
        onOpenChange(false);
        setIsExporting(false);
        return;
      }

      const ff = await ensureFfmpeg();

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
        console.log(`[AudioCutter] exported .${ext}`, { name: file.name, size: file.size, type: file.type, start: selectionStart, end: selectionEnd });
        const segDuration = isFullSelection ? duration : Math.ceil(selectionEnd - selectionStart);
        if (process.env.NODE_ENV === 'development') {
          triggerDownload(file);
        }
        onConfirm(file, segDuration);
        onOpenChange(false);
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
      console.log('[AudioCutter] exported .mp3', { name: file2.name, size: file2.size, type: file2.type, start: selectionStart, end: selectionEnd });
      const segDuration2 = isFullSelection ? duration : Math.ceil(selectionEnd - selectionStart);
      if (process.env.NODE_ENV === 'development') {
        triggerDownload(file2);
      }
      onConfirm(file2, segDuration2);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.showToast('Export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  }, [duration, ensureFfmpeg, isFullSelection, onConfirm, onOpenChange, selectionEnd, selectionStart, sourceFile, sourceType, toast]);

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
  };

  const onPickVideo = () => {
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none sm:max-w-6xl w-[min(96vw,1200px)]">
        <DialogHeader>
          <DialogTitle>Audio Editor</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Top controls */}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onPickAudio} disabled={isExporting}>
              <Upload className="w-4 h-4 mr-2" /> Upload Audio
            </Button>
            <Button type="button" variant="outline" onClick={onPickVideo} disabled={isExporting}>
              <Upload className="w-4 h-4 mr-2" /> Extract From Video
            </Button>
     
          </div>

          {/* Info */}
          {sourceFile ? (
            <div className="text-sm text-muted-foreground">Selected: {sourceFile.name} {effectiveDuration > 0 && `( ${formatSeconds(effectiveDuration)} )`}</div>
          ) : (
            <div className="text-sm text-muted-foreground">Please upload an audio file or a video to extract audio</div>
          )}

          {/* Fake waveform with selection */}
          <div
            ref={containerRef}
            className="relative w-full h-28 bg-slate-800/40 rounded-lg border border-white/10 overflow-hidden select-none"
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
            <div className="absolute inset-0 flex items-center px-3 gap-[3px] z-10">
              {bars.map((h, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-white/60 rounded-sm"
                  style={{ height: `${Math.floor(h * 70)}%` }}
                />
              ))}
            </div>
            {/* selection overlay */}
            {duration > 0 && (
              <>
                <div
                  className="absolute top-0 bottom-0 bg-primary/25 border-x-2 border-primary z-20"
                  style={{ left: `${timeToPercent(selectionStart)}%`, width: `${timeToPercent(selectionEnd) - timeToPercent(selectionStart)}%` }}
                />
                {/* Start/End handles */}
                <div
                  className="absolute top-0 bottom-0 w-[12px] sm:w-[6px] bg-primary/90 cursor-ew-resize z-30 -translate-x-1/2 rounded"
                  style={{ left: `${timeToPercent(selectionStart)}%` }}
                />
                <div
                  className="absolute top-0 bottom-0 w-[12px] sm:w-[6px] bg-primary/90 cursor-ew-resize z-30 -translate-x-1/2 rounded"
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
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>Start: {formatSeconds(selectionStart)}</div>
            <div>End: {formatSeconds(getClampedEndForDisplay())}</div>
          </div>

          <div className="text-xs text-muted-foreground">
            Drag to select a range. If you do not trim, click Confirm to use the full audio.
          </div>

          {/* Play + Select All in one row (with preview hint) */}
          <div className="flex items-center gap-2">
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
      
            <Button type="button" size="sm" variant="outline" onClick={handlePreviewToggle} disabled={!previewUrl || duration <= 0}>
              {isPlaying ? <><Pause className="w-4 h-4 mr-1" /> Pause</> : <><Play className="w-4 h-4 mr-1" /> Play selection</>}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (duration > 0) {
                  setSelectionStart(0);
                  setSelectionEnd(duration);
                }
              }}
              disabled={duration <= 0}
            >
              Select All
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mr-1">
              Preview selection ({formatSeconds(Math.max(0, Math.ceil(selectionEnd - selectionStart)))})
            </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!sourceFile || isExporting}>
              {isExporting ? 'Exporting...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


