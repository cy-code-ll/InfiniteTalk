import { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '../../components/Footer';
import InfiniteTalkGenerator from './InfiniteTalkGenerator';

// SEO metadata
export const metadata: Metadata = {
  title: 'Meigen Infinite Talk AI - Create Infinite Talking Videos',
  description: 'Generate unlimited talking videos with Meigen Infinite Talk AI. Upload image and audio to create professional lip-sync videos instantly.',
  keywords: 'Meigen Infinite Talk AI, talking video generator, lip sync AI, infinite video, AI dubbing',
  openGraph: {
    title: 'Meigen AI Infinite Talk - Create Infinite Talking Videos',
    description: 'Generate unlimited talking videos with Meigen AI Infinite Talk. Upload image and audio to create professional lip-sync videos instantly.',
    url: 'https://www.infinitetalk.net/infinitetalk',
    siteName: 'InfiniteTalk AI',
    images: [
      {
        url: 'https://www.infinitetalk.net/og-infinitetalk.jpg',
        width: 1200,
        height: 630,
        alt: 'Meigen AI Infinite Talk Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Meigen AI Infinite Talk - Create Infinite Talking Videos',
    description: 'Generate unlimited talking videos with Meigen AI Infinite Talk. Upload image and audio to create professional lip-sync videos.',
    images: ['https://www.infinitetalk.net/og-infinitetalk.jpg'],
  },
  alternates: {
    canonical: 'https://www.infinitetalk.net/infinitetalk',
  },
};

// JSON-LD structured data
const infiniteTalkSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Meigen AI Infinite Talk',
  description: 'Advanced AI tool for generating infinite-length talking videos with lip-sync technology',
  url: 'https://www.infinitetalk.net/infinitetalk',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free trial available'
  },
  creator: {
    '@type': 'Organization',
    name: 'InfiniteTalk AI'
  },
  featureList: [
    'Upload image and audio files',
    'AI-powered lip synchronization',
    'Infinite-length video generation',
    'Professional quality output',
    'Real-time progress tracking'
  ],
  video: {
    '@type': 'VideoObject',
    name: 'Meigen Infinite Talk AI Demo',
    description: 'Demonstration of how Meigen Infinite Talk AI creates talking videos from images and audio',
    contentUrl: 'https://www.infinitetalk.net/hero/demo.mp4',
    embedUrl: 'https://www.infinitetalk.net/hero/demo.mp4',
    uploadDate: '2025-01-01',
    duration: 'PT30S'
  }
};

// How-to structured data
const howToSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use Meigen Infinite Talk AI',
  description: 'Step-by-step guide to create talking videos with Meigen Infinite Talk AI',
  totalTime: 'PT5M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0'
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'Image file of a person'
    },
    {
      '@type': 'HowToSupply', 
      name: 'Audio file with speech'
    }
  ],
  tool: [
    {
      '@type': 'SoftwareApplication',
      name: 'Meigen Infinite Talk AI',
      url: 'https://www.infinitetalk.net/infinitetalk'
    }
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Upload Image',
      text: 'Upload a clear image of a person\'s face to the Meigen Infinite Talk AI platform.',
      url: 'https://www.infinitetalk.net/infinitetalk#step1'
    },
    {
      '@type': 'HowToStep', 
      name: 'Upload Audio',
      text: 'Select and upload your audio file containing the speech or dialogue you want to sync.',
      url: 'https://www.infinitetalk.net/infinitetalk#step2'
    },
    {
      '@type': 'HowToStep',
      name: 'Write Prompt',
      text: 'Describe what you want the character to express or the emotion you want to convey.',
      url: 'https://www.infinitetalk.net/infinitetalk#step3'
    },
    {
      '@type': 'HowToStep',
      name: 'Generate Video',
      text: 'Click the Generate button and wait for Meigen Infinite Talk AI to create your talking video.',
      url: 'https://www.infinitetalk.net/infinitetalk#step4'
    }
  ]
};

export default function InfiniteTalkPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD structured data */}
      <Script id="ld-json-infinitetalk" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(infiniteTalkSchemaData) }}
      />
      <Script id="ld-json-howto" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchemaData) }}
      />
      
      <main className="flex-grow relative pt-20">
        {/* Fixed background gradient */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
        
        {/* Header Section */}
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Meigen Infinite Talk AI  Generator
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
            Transform any image into a talking video with our advanced AI technology. Upload your image and audio to create professional lip-synced content.
          </p>
        </div>

        {/* Generator Component */}
        <InfiniteTalkGenerator />
        
        {/* How to Use Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  How to Use Meigen Infinite Talk AI
                </h2>
                <p className="text-slate-300 text-lg">
                  Follow these simple steps to create your talking video
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div id="step1" className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Upload Image</h3>
                  <p className="text-slate-400 text-sm">
                    Upload a clear image of a person's face
                  </p>
                </div>
                
                <div id="step2" className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Upload Audio</h3>
                  <p className="text-slate-400 text-sm">
                    Select your audio file for the speech
                  </p>
                </div>
                
                <div id="step3" className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-xl">3</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Write Prompt</h3>
                  <p className="text-slate-400 text-sm">
                    Describe what you want the character to express
                  </p>
                </div>
                
                <div id="step4" className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary font-bold text-xl">4</span>
                  </div>
                  <h3 className="text-white font-semibold mb-2">Generate</h3>
                  <p className="text-slate-400 text-sm">
                    Click Generate to create your talking video
                  </p>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-sm">💡</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Pro Tips</h4>
                    <p className="text-slate-300 text-sm">
                      For best results, use high-quality images with clear facial features and audio with good clarity. 
                      The AI works better with frontal face images and clear speech audio. 
                      <strong className="text-yellow-400">Maximum generation duration is 600 seconds.</strong>
                    </p>
                    <p className="text-slate-300 text-sm mt-2">
                      <strong className="text-primary">Credit Cost:</strong> Every 5 seconds, 480P requires 5 credits, 720P requires 10 credits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer without friendly links */}
      <Footer />
    </div>
  );
}
