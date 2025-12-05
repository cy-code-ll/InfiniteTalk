import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverCmsApi } from '@/lib/server-api';
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

  // 使用原始图片作为缩略图，如果不是图片则使用默认分享图
  const getThumbnailUrl = () => {
    // 检查 origin_image 是否是图片格式
    if (opusDetail.origin_image && opusDetail.origin_image.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return opusDetail.origin_image;
    }
    // 如果没有合适的图片，使用默认品牌分享图
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://infinitetalk.net'}/share-img.png`;
  };

  const thumbnailUrl = getThumbnailUrl();

  const description = 'Check out this amazing AI-generated video! Create your own at https://www.infinitetalk.net';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.infinitetalk.net';

  return {
    title: 'Amazing Video Created with InfiniteTalk',
    description: description,
    alternates: {
      canonical: `${siteUrl}/share/${id}`,
    },
    openGraph: {
      title: 'Amazing Video Created with InfiniteTalk',
      description: description,
      type: 'video.other',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://infinitetalk.net'}/share/${id}`,
      images: [
        {
          url: thumbnailUrl,
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
      card: 'player',  // 视频播放器卡片
      title: 'Amazing Video Created with InfiniteTalk',
      description: description,
      images: [thumbnailUrl],  // 缩略图（origin_image）
      players: {
        playerUrl: opusDetail.generate_image,  // 视频 URL
        streamUrl: opusDetail.generate_image,  // 视频流 URL
        width: 1280,
        height: 720,
      },
    },
  };
}


export default async function ShareVideoPage({ params }: { params: Promise<{ id: string }> }) {
  // 获取视频详情
  const { id } = await params;
  const opusDetail = await serverCmsApi.getOpusDetail(id);
  // console.log(opusDetail);
  // 如果视频不存在或状态不正确，显示 404
  if (!opusDetail || opusDetail.status !== 1) {
    notFound();
  }

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

          {/* Video and CTA */}
          <div className="bg-card rounded-2xl border border-border shadow-xl p-6">
            <div className="flex flex-col justify-center space-y-4 max-w-2xl mx-auto">
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

