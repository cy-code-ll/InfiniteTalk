import { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '@/components/Footer';
import InfiniteTalkGenerator from './InfiniteTalkGenerator';
import CTASection from '@/app/infinitetalk/CTASection';

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
  ]
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

// FAQ structured data
const faqSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  name: 'Meigen Infinite Talk AI - Frequently Asked Questions',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Meigen Infinite Talk AI?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Meigen Infinite Talk AI is an audio-driven video generation tool for creating lifelike talking avatar videos. It brings characters to life by producing natural lip-sync, expressive facial movements, and realistic body gestures from images or videos.'
      }
    },
    {
      '@type': 'Question',
      name: 'How does Meigen Infinite Talk AI work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Meigen Infinite Talk AI uses a sparse-frame video dubbing framework that takes any video and audio track and synthesizes a seamless new video where lips, head movements, posture, and expressions all stay perfectly in sync with the voice.'
      }
    },
    {
      '@type': 'Question',
      name: 'What inputs does Meigen Infinite Talk AI support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can provide either a video + audio (Video2Video) or a single image + audio (ImageToVideo). Simply upload your image or video file along with an audio file containing the speech you want to sync.'
      }
    },
    {
      '@type': 'Question',
      name: 'How long can videos generated with Meigen Infinite Talk AI be?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Meigen Infinite Talk AI can generate videos of unlimited length. Unlike traditional tools that cap content at just a few seconds, you can create videos that last minutes or even longer, limited only by your device\'s computing power. Maximum generation duration is 600 seconds.'
      }
    },
    {
      '@type': 'Question',
      name: 'What resolutions are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Meigen Infinite Talk AI supports 480p, 720p, and 1080p resolutions. Every 5 seconds, 480P requires 5 credits, 720P requires 10 credits, and 1080P requires 15 credits.'
      }
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Video2Video and ImageToVideo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Video2Video transforms any video into a fully animated talking character, while ImageToVideo brings static photos to life with just a single image and audio track. Both methods produce natural lip-sync and facial expressions.'
      }
    },
    {
      '@type': 'Question',
      name: 'What file formats are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For best results, use high-quality images with clear facial features (frontal face images work best) and audio files with good clarity. The AI works with various image and audio formats commonly used for video production.'
      }
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
      <Script id="ld-json-faq" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/infinitetalk#breadcrumb',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: 'https://www.infinitetalk.net/'
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'InfiniteTalk',
              item: 'https://www.infinitetalk.net/infinitetalk'
            }
          ]
        }) }}
      />
      
      <main className="flex-grow relative pt-15">
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
        <div id="infinite-talk-generator">
          <InfiniteTalkGenerator />
        </div>
        
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
                      <strong className="text-primary">Credit Cost:</strong> Every 5 seconds, 480P requires 5 credits, 720P requires 10 credits, 1080P requires 15 credits.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What is InfiniteTalk AI Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                What is Infinite Talk AI?
              </h2>
                <div className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed space-y-6">
                  <p>
                    Infinite Talk AI is an audio-driven video generation tool for creating lifelike talking avatar videos. 
                    By using audio as the driver, it brings characters to life—producing natural lip-sync, expressive 
                    facial movements, and realistic body gestures, whether from an image or video.
                  </p>
                  
                  <p>
                    Built on a sparse-frame video dubbing framework, Infinite Talk AI takes any video and audio track and 
                    synthesizes a seamless new video where lips, head movements, posture, and expressions all stay 
                    perfectly in sync with the voice.
                  </p>
                  
                  <p>
                    One of its standout features is the ability to generate videos of unlimited length. Unlike traditional 
                    tools that cap content at just a few seconds, Infinite Talk AI lets you create videos that last minutes—or 
                    even longer—limited only by your device's computing power.
                  </p>
                </div>
            </div>

            {/* Key Features */}
            <div className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-3xl border border-slate-700/50 backdrop-blur-xl p-8 md:p-12 mb-16">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">
                Powered by a sparse-frame video dubbing framework, Infinite Talk AI generates new videos from any given footage and audio, ensuring:
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-400 text-xl">👄</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Accurate lip synchronization</h4>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-400 text-xl">👁️</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Natural head and eye movements</h4>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-400 text-xl">😊</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Emotionally aligned facial expressions</h4>
                </div>
                <div className="text-center p-6 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-primary/30 transition-colors">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-orange-400 text-xl">🤸</span>
                  </div>
                  <h4 className="text-white font-semibold mb-2">Subtle adjustments in body posture</h4>
                </div>
              </div>
            </div>

            {/* Video2Video Section */}
            <div className="mb-16">
              <div className="bg-gradient-to-r from-emerald-800/20 to-emerald-900/20 rounded-3xl border border-emerald-700/30 backdrop-blur-xl p-8 md:p-12">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-emerald-400 text-2xl">🎬</span>
                      </div>
                      <h3 className="text-3xl font-bold text-white"> Infinite Talk AI - Video2Video</h3>
                    </div>
                    <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                      The Video2Video feature has become one of the most popular workflows in Infinite Talk AI. 
                      It transforms any video into a fully animated talking character.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-emerald-400 text-sm">1</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Original Video Footage</h4>
                          <p className="text-slate-400 text-sm">Upload a video containing the person or character.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-emerald-400 text-sm">2</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Audio or Script Input</h4>
                          <p className="text-slate-400 text-sm">Provide the voice track or text-to-speech script.</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 mb-6">
                      The system automatically detects the face, tracks movements frame by frame, and generates lip-sync 
                      and expressions that match perfectly. Even if the character turns their head or moves, the animation 
                      remains consistent and natural.
                    </p>

                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
                      <div className="text-white font-semibold mb-3">Best suited for:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">Commercial ads</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">E-commerce product explainers</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">Narrative storytelling</span>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">Social media content</span>
                      </div>
                    </div>
                  </div>
         
                </div>
              </div>
            </div>

            {/* ImageToVideo Section */}
            <div className="mb-16">
              <div className="bg-gradient-to-r from-purple-800/20 to-purple-900/20 rounded-3xl border border-purple-700/30 backdrop-blur-xl p-8 md:p-12">
                <div className="flex flex-col lg:flex-row gap-8 items-center">
          
                  <div className="flex-1 order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <span className="text-purple-400 text-2xl">📸</span>
                      </div>
                      <h3 className="text-3xl font-bold text-white"> Infinite Talk AI - ImageToVideo</h3>
                    </div>
                    <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                      Beyond video input, Infinite Talk AI also offers ImageToVideo, which brings static photos to life. 
                      With just a single image and an audio track, you can generate a smooth, natural talking avatar video.
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-400 text-sm">⚡</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">One-click creation</h4>
                          <p className="text-slate-400 text-sm">Simply upload an image and audio to generate a talking video.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-400 text-sm">🎭</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Realistic performance</h4>
                          <p className="text-slate-400 text-sm">AI models facial features and head movement to avoid the "stiff" effect.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-400 text-sm">😊</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Emotion-driven animation</h4>
                          <p className="text-slate-400 text-sm">Facial expressions reflect the tone of the voice (smiles, surprise, questioning, etc.).</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-purple-400 text-sm">🪶</span>
                        </div>
                        <div>
                          <h4 className="text-white font-semibold mb-1">Lightweight workflow</h4>
                          <p className="text-slate-400 text-sm">No need for video footage, a single photo is enough.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-600/30">
                      <div className="text-white font-semibold mb-3">Use cases:</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">AI virtual presenters</span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Personal branding</span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Brand mascots</span>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Virtual lecturers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Architecture Section */}
            <div className="mb-16">
              <div className="bg-gradient-to-r from-slate-800/20 to-slate-900/20 rounded-3xl border border-slate-700/30 backdrop-blur-xl p-8 md:p-12">
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-slate-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-slate-400 text-2xl">⚙️</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white"> Infinite Talk AI - Technical Architecture</h3>
                  </div>
                  <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
                    Infinite Talk AI runs on a smart technical backbone that makes all the magic possible. 
                    To keep videos smooth and natural, the system processes them in small chunks of frames instead of all at once.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                  {/* Frame Processing */}
                  <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-600/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-lg">🎬</span>
                      </div>
                      <h4 className="text-xl font-semibold text-white">Smart Frame Processing</h4>
                    </div>
                    <p className="text-slate-300 mb-4">
                      Each chunk is about <span className="text-blue-400 font-semibold">81 frames long</span>, and the last 
                      <span className="text-blue-400 font-semibold"> 25 frames</span> are carried over into the next chunk. 
                      This overlap makes sure transitions feel seamless—so you never see any weird jumps or broken motion.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Seamless frame transitions</span>
                    </div>
                  </div>

                  {/* Resolution Support */}
                  <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-600/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 text-lg">📺</span>
                      </div>
                      <h4 className="text-xl font-semibold text-white">Resolution Flexibility</h4>
                    </div>
                    <p className="text-slate-300 mb-4">
                      The platform supports both <span className="text-green-400 font-semibold">480p</span> (for faster results) 
                      and <span className="text-green-400 font-semibold">720p</span> (for sharper quality), giving users the 
                      flexibility to choose what works best for their needs.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Quality vs speed optimization</span>
                    </div>
                  </div>
                </div>

                {/* Performance Boosters */}
                <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-600/30">
                  <h4 className="text-xl font-semibold text-white mb-6 text-center">Performance Boosters</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-xl bg-slate-700/30 border border-slate-600/20">
                      <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-orange-400 text-xl">⚡</span>
                      </div>
                      <h5 className="text-white font-semibold mb-2">TeaCache Acceleration</h5>
                      <p className="text-slate-400 text-sm">Speeds up rendering for faster video generation</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-700/30 border border-slate-600/20">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-purple-400 text-xl">🔧</span>
                      </div>
                      <h5 className="text-white font-semibold mb-2">APG (Adaptive Parameter Grouping)</h5>
                      <p className="text-slate-400 text-sm">Keeps the system efficient and optimized</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-slate-700/30 border border-slate-600/20">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-cyan-400 text-xl">💾</span>
                      </div>
                      <h5 className="text-white font-semibold mb-2">Quantization Options</h5>
                      <p className="text-slate-400 text-sm">Lets it run smoothly even on lower-end GPUs with less VRAM</p>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-slate-700/30 to-slate-800/30 rounded-xl border border-slate-600/20">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-slate-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-slate-400 text-lg">💡</span>
                    </div>
                    <div>
                      <h5 className="text-white font-semibold mb-2">Built for Everyone</h5>
                      <p className="text-slate-300">
                        In short, the system is built to be <span className="text-slate-200 font-semibold">powerful</span>, 
                        <span className="text-slate-200 font-semibold"> flexible</span>, and 
                        <span className="text-slate-200 font-semibold"> accessible</span>, whether you're working on a 
                        lightweight laptop or a high-end workstation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <CTASection />
          </div>
        </div>
      </main>
      
      {/* Footer without friendly links */}
      <Footer />
    </div>
  );
}
