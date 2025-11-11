'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { DownloadIcon, ReloadIcon, Cross2Icon } from '@radix-ui/react-icons';
import { GenerationHistoryItem } from './types';
import { 
  formatTimestamp, 
  downloadMediaWithCors, 
  parseMediaUrls, 
  isVideoFile, 
  isImageFile, 
  isAudioFile 
} from './utils';
import { shareToSocial } from '@/lib/share-utils';
import { useToast } from '@/components/ui/toast-provider';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

interface VideoDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoDetail: GenerationHistoryItem | null;
  onDeleteSuccess: () => void;
}

export function VideoDetailDialog({ open, onOpenChange, videoDetail, onDeleteSuccess }: VideoDetailDialogProps) {
  const [isDownloading, setIsDownloading] = useState<number | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const toast = useToast();

  if (!videoDetail) return null;

  const handleDownload = () => {
    downloadMediaWithCors(
      videoDetail.generate_image,
      `video-${videoDetail.id}.mp4`,
      setIsDownloading,
      videoDetail.id,
      toast.showToast
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-[95vw] w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border shadow-2xl bg-card/95 backdrop-blur-xl [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted"
        >
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-semibold text-card-foreground">Video Details</DialogTitle>
          </DialogHeader>

          <div className="pt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：视频播放器 */}
            <div className="flex flex-col justify-center space-y-3">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <video
                  src={videoDetail.generate_image}
                  controls
                  className="w-full h-full"
                  playsInline
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* 下载和分享按钮 */}
              <div className="flex flex-wrap gap-2">
                {/* 下载按钮 */}
                <Button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 min-w-[120px]"
                  disabled={isDownloading === videoDetail.id}
                >
                  {isDownloading === videoDetail.id ? (
                    <>
                      <ReloadIcon className="h-4 w-4 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <DownloadIcon className="h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
                {/* 删除按钮 */}
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center gap-2 min-w-[100px]"
                >
                  <Cross2Icon className="h-4 w-4" />
                  Delete
                </Button>

                {/* 分享按钮组 */}
                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Twitter */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial(videoDetail.task_id, 'twitter')}
                    title="Share to Twitter"
                    className="hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] flex-1 sm:flex-none"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </Button>

                  {/* Facebook */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial(videoDetail.task_id, 'facebook')}
                    title="Share to Facebook"
                    className="hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] flex-1 sm:flex-none"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </Button>

                  {/* WhatsApp */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => shareToSocial(videoDetail.task_id, 'whatsapp')}
                    title="Share to WhatsApp"
                    className="hover:bg-[#25D366] hover:text-white hover:border-[#25D366] flex-1 sm:flex-none"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* 右侧：详细信息 */}
            <div className="space-y-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted">
              {/* Created At */}
              <div className="bg-muted/50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Created At</h3>
                <p className="text-card-foreground text-sm">{formatTimestamp(videoDetail.created_at)}</p>
              </div>

              {/* Resolution & Generation Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Resolution</h3>
                  <p className="text-card-foreground font-medium text-sm">
                    {videoDetail.size_image ? 
                      (() => {
                        const resolutionMatch = videoDetail.size_image.match(/resolution:\s*([^\s;]+)/i);
                        return resolutionMatch ? resolutionMatch[1].trim() : 'N/A';
                      })() 
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Generation Time</h3>
                  <p className="text-card-foreground text-sm">{videoDetail.generation_time || 0} seconds</p>
                </div>
              </div>

              {/* Prompt */}
              {videoDetail.prompt && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Prompt</h3>
                  <div className="max-h-32 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
                    <p className="text-card-foreground text-sm whitespace-pre-wrap">{videoDetail.prompt}</p>
                  </div>
                </div>
              )}

              {/* Origin Image/Video */}
              {videoDetail.origin_image && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Original Media</h3>
                  <div className="mt-2 rounded-lg overflow-hidden bg-slate-900">
                    {videoDetail.origin_image.match(/\.(mp4|webm|mov)$/i) ? (
                      <video
                        src={videoDetail.origin_image}
                        controls
                        className="w-full max-h-40 object-contain"
                        playsInline
                        controlsList="nodownload"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <Image
                        src={videoDetail.origin_image}
                        alt="Original media"
                        width={400}
                        height={300}
                        className="w-full max-h-40 object-contain"
                        unoptimized
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Additional Media Files */}
              {videoDetail.other_image && parseMediaUrls(videoDetail.other_image).length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Additional Media</h3>
                  <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto">
                    {parseMediaUrls(videoDetail.other_image).map((mediaUrl, index) => {
                      const isVideo = isVideoFile(mediaUrl);
                      const isImage = isImageFile(mediaUrl);
                      const isAudio = isAudioFile(mediaUrl);
                      
                      return (
                        <div key={index} className="bg-slate-900 rounded-lg p-2.5">
                          <p className="text-xs text-muted-foreground mb-1.5">
                            {isVideo ? `Video ${index + 1}` : isImage ? `Image ${index + 1}` : isAudio ? `Audio ${index + 1}` : `Media ${index + 1}`}
                          </p>
                          {isVideo ? (
                            <video
                              src={mediaUrl}
                              controls
                              className="w-full max-h-40 object-contain rounded"
                              playsInline
                              controlsList="nodownload"
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              Your browser does not support the video tag.
                            </video>
                          ) : isImage ? (
                            <div className="rounded overflow-hidden bg-slate-800">
                              <Image
                                src={mediaUrl}
                                alt={`Additional image ${index + 1}`}
                                width={400}
                                height={300}
                                className="w-full max-h-40 object-contain"
                                unoptimized
                              />
                            </div>
                          ) : isAudio ? (
                            <audio controls className="w-full h-8" preload="metadata">
                              <source src={mediaUrl} type="audio/wav" />
                              <source src={mediaUrl} type="audio/mpeg" />
                              <source src={mediaUrl} type="audio/ogg" />
                              <source src={mediaUrl} type="audio/mp4" />
                              Your browser does not support the audio element.
                            </audio>
                          ) : (
                            <div className="text-xs text-muted-foreground p-2">
                              Unsupported media type: <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{mediaUrl}</a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        videoId={videoDetail.id}
        onDeleteSuccess={() => {
          setIsDeleteConfirmOpen(false);
          onOpenChange(false);
          onDeleteSuccess();
        }}
      />
    </>
  );
}

