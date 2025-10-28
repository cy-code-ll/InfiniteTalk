import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverCmsApi } from '@/lib/server-api';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/Footer';

// 生成页面元数据（用于 Open Graph 标签）
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const opusDetail = await serverCmsApi.getOpusDetail(id);
  
  if (!opusDetail) {
    return {
      title: 'Video Not Found | InfiniteTalk',
    };
  }

  return {
    title: 'Amazing Video Created with InfiniteTalk',
    description: opusDetail.prompt || 'Check out this amazing AI-generated video!',
    openGraph: {
      title: 'Amazing Video Created with InfiniteTalk',
      description: opusDetail.prompt || 'Check out this amazing AI-generated video!',
      type: 'video.other',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://infinitetalk.net'}/share/${id}`,
      images: [
        {
          url: opusDetail.generate_image,
          width: 1200,
          height: 630,
          alt: 'Video preview',
        },
      ],
      videos: [
        {
          url: opusDetail.generate_image,
          type: 'video/mp4',
        },
      ],
    },
    twitter: {
      card: 'player',
      title: 'Amazing Video Created with InfiniteTalk',
      description: opusDetail.prompt || 'Check out this amazing AI-generated video!',
      images: [opusDetail.generate_image],
      players: {
        playerUrl: opusDetail.generate_image,
        streamUrl: opusDetail.generate_image,
        width: 1280,
        height: 720,
      },
    },
  };
}

// 格式化时间戳
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp * 1000));
  } catch (e) {
    return new Date(timestamp * 1000).toLocaleDateString();
  }
};

// 解析音频URL字符串（用 | 分割）
const parseAudioUrls = (audioString: string): string[] => {
  if (!audioString) return [];
  return audioString.split('|').filter(url => url.trim());
};

export default async function ShareVideoPage({ params }: { params: Promise<{ id: string }> }) {
  // 获取视频详情
  const { id } = await params;
  const opusDetail = await serverCmsApi.getOpusDetail(id);

  // 如果视频不存在或状态不正确，显示 404
  if (!opusDetail || opusDetail.status !== 1) {
    notFound();
  }

  // 解析 resolution
  const getResolution = (sizeImage: string) => {
    const resolutionMatch = sizeImage.match(/resolution:\s*([^\s;]+)/i);
    return resolutionMatch ? resolutionMatch[1].trim() : 'N/A';
  };

  const resolution = opusDetail.size_image ? getResolution(opusDetail.size_image) : 'N/A';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      {/* <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.webp" alt="InfiniteTalk" width={40} height={40} />
            <span className="text-xl font-bold text-card-foreground">InfiniteTalk</span>
          </Link>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="flex-grow py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-card-foreground mb-3">
              Amazing AI-Generated Video
            </h1>
            <p className="text-muted-foreground text-lg">
              Created with InfiniteTalk AI Video Generator
            </p>
          </div>

          {/* Video and Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-card rounded-2xl border border-border shadow-xl p-6">
            {/* Left: Video Player */}
            <div className="flex flex-col justify-center space-y-4">
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <video
                  src={opusDetail.generate_image}
                  controls
                  className="w-full h-full"
                  playsInline
                  preload="metadata"
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* CTA Button */}
              <Link href="/infinitetalk" className="w-full">
                <Button className="w-full text-lg py-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  Create Your Own Video
                </Button>
              </Link>
            </div>

            {/* Right: Details */}
            <div className="space-y-3">
              {/* Created At */}
              <div className="bg-muted/50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Created At</h3>
                <p className="text-card-foreground text-sm">{formatTimestamp(opusDetail.created_at)}</p>
              </div>

              {/* Resolution & Generation Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Resolution</h3>
                  <p className="text-card-foreground font-medium text-sm">{resolution}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Generation Time</h3>
                  <p className="text-card-foreground text-sm">{opusDetail.generation_time || 0} seconds</p>
                </div>
              </div>

              {/* Prompt */}
              {opusDetail.prompt && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Prompt</h3>
                  <p className="text-card-foreground text-sm whitespace-pre-wrap">{opusDetail.prompt}</p>
                </div>
              )}

              {/* Origin Image/Video */}
              {opusDetail.origin_image && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Original Media</h3>
                  <div className="mt-2 rounded-lg overflow-hidden bg-slate-900">
                    {opusDetail.origin_image.match(/\.(mp4|webm|mov)$/i) ? (
                      <video
                        src={opusDetail.origin_image}
                        controls
                        className="w-full max-h-40 object-contain"
                        playsInline
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <Image
                        src={opusDetail.origin_image}
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

              {/* Audio Files */}
              {opusDetail.other_image && parseAudioUrls(opusDetail.other_image).length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1.5">Audio Files</h3>
                  <div className="space-y-2 mt-2">
                    {parseAudioUrls(opusDetail.other_image).map((audioUrl, index) => (
                      <div key={index} className="bg-slate-900 rounded-lg p-2.5">
                        <p className="text-xs text-muted-foreground mb-1.5">Audio {index + 1}</p>
                        <audio controls className="w-full h-8" preload="metadata">
                          <source src={audioUrl} type="audio/wav" />
                          <source src={audioUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-3">
              Want to Create Your Own AI Videos?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of creators using InfiniteTalk to generate stunning AI-powered videos. 
              Transform your images and audio into amazing animated content with just a few clicks!
            </p>
            <Link href="/infinitetalk">
              <Button size="lg" className="text-lg px-8 py-6">
                Get Started Now - It's Free!
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

