import type { Metadata } from 'next';
import { Footer } from '../../components/Footer';

export const metadata: Metadata = {
  title: 'InfiniteTalk AI APP',
  description: 'Download the InfiniteTalk AI app on Google Play and turn images into realistic talking videos with accurate lip sync.',
  openGraph: {
    title: 'InfiniteTalk AI APP',
    description: 'Download the InfiniteTalk AI app on Google Play and turn images into realistic talking videos with accurate lip sync.',
    url: 'https://www.infinitetalk.net/app',
    siteName: 'InfiniteTalk AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfiniteTalk AI APP',
    description: 'Download the InfiniteTalk AI app on Google Play and turn images into realistic talking videos with accurate lip sync.',
  },
  alternates: {
    canonical: 'https://www.infinitetalk.net/app',
  },
};

export default function AppDownloadPage() {
  const playUrl = 'https://play.google.com/store/apps/details?id=com.cykj.ghiblipro2';

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow relative">
        {/* Background gradients for consistency with site styling */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />

        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto bg-card rounded-2xl shadow-custom p-8 md:p-12 text-center">
            <h1 className="font-poppins font-bold text-primary text-3xl md:text-4xl">InfiniteTalk AI APP</h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Bring your images to life. Upload a photo and audio to generate realistic talking videos with accurate lip sync—right from your phone.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4">
              <a
                href={playUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Download on Google Play
              </a>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Available on Android via Google Play.
            </p>
          </div>
        </section>
        
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center font-poppins font-semibold text-foreground text-2xl md:text-3xl">MOBILE VS DESKTOP</h2>
            <h3 className="mt-2 text-center font-poppins font-bold text-primary text-2xl md:text-3xl">Why Choose Mobile App Over Web-Based Solutions?</h3>
            <p className="mt-4 text-center text-base md:text-lg text-muted-foreground">
              We've analyzed real-world usage scenarios across 3 key dimensions to demonstrate how mobile-first design delivers superior efficiency, convenience, and security for content creators.
            </p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card rounded-2xl shadow-custom p-6">
                <div className="text-2xl">📱</div>
                <h4 className="mt-3 font-semibold text-lg text-foreground">On-the-Go Creation</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Break free from desktop constraints. Create professional-quality videos anywhere inspiration strikes — during commutes, coffee breaks, or spontaneous creative moments.
                </p>
              </div>
              <div className="bg-card rounded-2xl shadow-custom p-6">
                <div className="text-2xl">📹</div>
                <h4 className="mt-3 font-semibold text-lg text-foreground">Direct Camera Access</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Seamlessly integrate with your device's camera to capture real-time footage, photos, and live content. Create videos directly from camera input with instant AI enhancement and processing.
                </p>
              </div>
              <div className="bg-card rounded-2xl shadow-custom p-6">
                <div className="text-2xl">📤</div>
                <h4 className="mt-3 font-semibold text-lg text-foreground">Seamless Social Integration</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share directly to TikTok, Instagram, YouTube Shorts, and other platforms without the hassle of file exports and re-uploads. Streamline your content distribution workflow.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}


