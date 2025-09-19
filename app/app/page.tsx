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

        {/* Hero */}
        <section className="container mx-auto px-6 pt-20 md:pt-28">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="font-poppins font-extrabold text-4xl md:text-5xl tracking-tight text-foreground">
              InfiniteTalk App · Professional AI Video Creation
            </h1>
            <p className="mt-4 md:mt-5 text-base md:text-lg text-muted-foreground">
              Discover the advantages of the InfiniteTalk App over web-based tools. Enjoy unparalleled convenience with on-the-go creation, direct camera access, and seamless social sharing.
            </p>
          </div>
        </section>

        {/* Download Area */}
        <section className="container mx-auto px-6 pb-8 md:pb-12 pt-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="mt-2 flex flex-col md:flex-row items-center justify-center gap-4">
                {/* App Store */}
                <a
                  href="https://apps.apple.com/gb/app/infinitetalkai/id6747014221"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 rounded-lg bg-white text-gray-900 border border-gray-200 flex items-center justify-center gap-3 px-6 hover:bg-gray-100 hover:border-gray-300 hover:shadow-md hover:scale-105 transition-all duration-200 w-auto"
                >
                  <svg className="h-6 w-6" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M521.995587 236.597895a154.138947 154.138947 0 0 0 35.031579-4.850527h5.389474a179.469474 179.469474 0 0 0 35.570526-16.168421h4.850527a209.650526 209.650526 0 0 0 30.72-20.48l3.772631-3.233684a234.442105 234.442105 0 0 0 26.947369-26.947368l3.233684-3.233684a242.526316 242.526316 0 0 0 22.096842-32.336843v-3.772631a232.825263 232.825263 0 0 0 16.168421-36.648421V86.231579a211.267368 211.267368 0 0 0 9.162105-39.882105 188.092632 188.092632 0 0 0 0-42.037895A227.435789 227.435789 0 0 0 512.294535 236.058947zM813.027166 616.016842a218.812632 218.812632 0 0 1-14.551579-86.231579 212.345263 212.345263 0 0 1 10.24-57.667368 215.578947 215.578947 0 0 1 26.408421-53.894737 245.221053 245.221053 0 0 1 71.141053-68.985263 236.597895 236.597895 0 0 0-154.138947-97.549474 250.610526 250.610526 0 0 0-35.031579-4.311579h-65.212632l-15.629474 4.311579-11.856842 3.772632-15.090526 5.389473-10.778947 8.623158-17.785263 7.006316-14.551579 5.928421-10.24 3.772632-12.39579 3.772631h-7.006316a73.296842 73.296842 0 0 1-16.707368 0 77.608421 77.608421 0 0 1-16.168421 0h-5.928421l-11.856842-3.233684-8.623158-3.233684-12.39579-3.233684-20.48-8.084211L436.302956 269.473684l-14.551579-5.389473-9.701053-3.233685-13.473684-4.311579H388.33664l-14.012632-2.694736h-10.778947L350.610324 250.071579A256.538947 256.538947 0 0 0 254.138745 269.473684 291.570526 291.570526 0 0 0 81.13664 554.576842v53.894737c0 4.311579 0 19.402105 3.772632 29.103158s0 10.778947 3.233684 16.168421 3.233684 17.246316 5.389473 25.869474 3.233684 11.317895 4.850527 16.707368 4.311579 16.168421 7.006316 24.252632 4.311579 11.856842 6.467368 17.785263l8.084211 22.635789 7.545263 17.246316c3.233684 7.006316 5.928421 14.551579 9.162105 21.557895l8.08421 16.168421 10.778948 21.018947 9.162105 15.629474 11.317895 19.402105 9.701052 14.551579 11.856843 17.785263 10.24 13.473684 12.395789 15.629474 10.778947 12.39579 12.39579 13.473684 11.317895 10.778947 12.395789 11.317895 11.317895 8.623158 12.395789 9.162105 11.317895 6.467368 11.856842 6.467369 10.778948 3.772631 11.856842 3.772632L350.610324 1024H363.006114a161.684211 161.684211 0 0 0 43.115789-7.545263 331.991579 331.991579 0 0 1 126.652632-34.492632 198.871579 198.871579 0 0 1 26.947368 0h8.623158l14.551579 3.233684 9.162105 2.694737 11.317895 3.772632 9.701053 3.772631 14.012631 5.928422 12.39579 5.389473 8.08421 2.694737 10.778948 3.772632H704.159798a154.138947 154.138947 0 0 0 95.393684-44.193685 551.882105 551.882105 0 0 0 119.107369-165.995789 568.050526 568.050526 0 0 0 24.791578-51.738947 247.915789 247.915789 0 0 1-130.425263-135.27579z" fill="#000"/></svg>
                  <span className="text-sm md:text-base font-medium">App Store</span>
                </a>
                {/* Google Play */}
                <a
                  href={playUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-14 rounded-lg bg-white text-gray-900 border border-gray-200 flex items-center justify-center gap-3 px-6 hover:bg-gray-100 hover:border-gray-300 hover:shadow-md hover:scale-105 transition-all duration-200 w-auto"
                >
                  <svg className="h-6 w-6" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path fill="none" d="M0,0h40v40H0V0z"></path>
                    <g>
                      <path d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z" fill="#EA4335"></path>
                      <path d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z" fill="#FBBC04"></path>
                      <path d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z" fill="#4285F4"></path>
                      <path d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z" fill="#34A853"></path>
                    </g>
                  </svg>
                  <span className="text-sm md:text-base font-medium">Google Play</span>
                </a>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose Section */}
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


