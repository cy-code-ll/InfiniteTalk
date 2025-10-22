import { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '@/components/Footer';

// SEO metadata
export const metadata: Metadata = {
  title: 'InfiniteTalk ComfyUI Integration - Complete Setup Guide',
  description: 'Learn how to integrate InfiniteTalk with ComfyUI for unlimited talking avatar generation. Step-by-step setup guide with model files and workflow examples.',
  keywords: 'infinite talk comfyui, infinitetalk comfyui setup, talking avatar comfyui, lip sync video generation',
  openGraph: {
    title: 'InfiniteTalk ComfyUI Integration - Complete Setup Guide',
    description: 'Learn how to integrate InfiniteTalk with ComfyUI for unlimited talking avatar generation. Step-by-step setup guide with model files and workflow examples.',
    url: 'https://www.infinitetalk.net/infinitetalk-comfyui',
    siteName: 'InfiniteTalk AI',
    images: [
      {
        url: 'https://www.infinitetalk.net/og-infinitetalk-comfyui.jpg',
        width: 1200,
        height: 630,
        alt: 'InfiniteTalk ComfyUI Integration Guide',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfiniteTalk ComfyUI Integration - Complete Setup Guide',
    description: 'Learn how to integrate InfiniteTalk with ComfyUI for unlimited talking avatar generation. Step-by-step setup guide with model files and workflow examples.',
    images: ['https://www.infinitetalk.net/og-infinitetalk-comfyui.jpg'],
  },
  alternates: {
    canonical: 'https://www.infinitetalk.net/infinitetalk-comfyui',
  },
};

// JSON-LD structured data
const comfyuiSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Set Up InfiniteTalk in ComfyUI',
  description: 'Complete guide to integrate InfiniteTalk with ComfyUI for unlimited talking avatar generation',
  totalTime: 'PT30M',
  estimatedCost: {
    '@type': 'MonetaryAmount',
    currency: 'USD',
    value: '0'
  },
  supply: [
    {
      '@type': 'HowToSupply',
      name: 'ComfyUI installation'
    },
    {
      '@type': 'HowToSupply', 
      name: 'Juan video wrapper'
    },
    {
      '@type': 'HowToSupply',
      name: 'InfiniteTalk model files'
    }
  ],
  tool: [
    {
      '@type': 'SoftwareApplication',
      name: 'ComfyUI',
      url: 'https://github.com/comfyanonymous/ComfyUI'
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Juan Video Wrapper',
      url: 'https://github.com/juan-carlos-correa/juan-video-wrapper'
    }
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Update Juan Video Wrapper',
      text: 'Update the Juan video wrapper to the latest version in ComfyUI to get InfiniteTalk support.',
      url: 'https://www.infinitetalk.net/infinitetalk-comfyui#step1'
    },
    {
      '@type': 'HowToStep', 
      name: 'Download Model Files',
      text: 'Download InfiniteTalk model files from the official Hugging Face repository.',
      url: 'https://www.infinitetalk.net/infinitetalk-comfyui#step2'
    },
    {
      '@type': 'HowToStep',
      name: 'Install Model Files',
      text: 'Place the downloaded model files in the ComfyUI models folder.',
      url: 'https://www.infinitetalk.net/infinitetalk-comfyui#step3'
    },
    {
      '@type': 'HowToStep',
      name: 'Create Workflow',
      text: 'Use the example workflow to create your first InfiniteTalk video.',
      url: 'https://www.infinitetalk.net/infinitetalk-comfyui#step4'
    }
  ]
};

export default function InfiniteTalkComfyUIPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD structured data */}
      <Script id="ld-json-comfyui" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comfyuiSchemaData) }}
      />
      
      <main className="flex-grow relative pt-20">
        {/* Fixed background gradient */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
        
        {/* Header Section */}
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            InfiniteTalk ComfyUI Integration
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto">
            Complete guide to integrate InfiniteTalk with ComfyUI for unlimited talking avatar generation with enhanced lip sync and natural body movements
          </p>
        </div>

        {/* Content Sections */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* What is InfiniteTalk ComfyUI Section */}
            <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                What is InfiniteTalk ComfyUI Integration?
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  InfiniteTalk is a new talking avatar framework from the MultiTalk team that enables audio-driven video generation for creating talking avatar videos. The cool thing about this framework is one of its key features: it can generate videos of infinite length.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  This means we're not stuck with just 10 or 15 seconds anymore. We can go for minutes, even longer, as long as your computer has enough RAM and VRAM to handle it. The way it works is pretty similar to the earlier versions of MultiTalk - it's still audio-driven, generating videos from image to video with natural lip syncing and enhanced body motions while the character talks.
                </p>
              </div>
            </section>

            {/* Setup Guide Section */}
            <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Setting Up InfiniteTalk in ComfyUI
              </h2>
              
              <div className="space-y-8">
                <div id="step1" className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3 text-primary font-bold">1</span>
                    Update Juan Video Wrapper
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    To get started, all you need to do in ComfyUI is update the Juan video wrapper to the latest version if you are an existing user, and it'll have the code that supports InfiniteTalk. Otherwise, download the Juan video wrapper from GitHub.
                  </p>
                </div>

                <div id="step2" className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3 text-primary font-bold">2</span>
                    Download InfiniteTalk Model Files
                  </h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    Once you've updated, you'll need to download the InfiniteTalk model files for this lip-syncing video generation. Get them from the official Hugging Face repository for InfiniteTalk. Go to the file versions and you'll see a folder labeled ComfyUI - that's the one with AI models exported specifically for ComfyUI.
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    Inside, you'll find two files: InfiniteTalk Single and InfiniteTalk Multi. One's for a single person talking avatar and the other is for multiple people. For most users, the single version is sufficient for testing lip syncing and overall performance.
                  </p>
                </div>

                <div id="step3" className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center mr-3 text-primary font-bold">3</span>
                    Install Model Files
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    Once you download the InfiniteTalk single safetensor files, drop them into the diffusion model subfolder inside the ComfyUI models folder. You can organize your downloaded model files into a separate folder there for better organization.
                  </p>
                </div>
              </div>
            </section>

            {/* Creating Workflow Section */}
            <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Creating Your First InfiniteTalk Workflow
              </h2>
              
              <div className="space-y-8">
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4">Using Example Workflows</h3>
                  <p className="text-slate-300 leading-relaxed mb-4">
                    The easiest way to run InfiniteTalk for lip syncing is to use the example workflow that comes with the Juan video wrapper. After you update the custom nodes, you'll notice the MultiTalk nodes have changed. The names now show up as MultiTalk and Infinite MultiTalk.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4">Model Selection</h3>
                  <p className="text-slate-300 leading-relaxed">
                    For the MultiTalk or InfiniteTalk model loader, select the InfiniteTalk model. Since most users start with a single person, pick the single version. The rest is pretty standard - block swap, torch compile settings, VAE, clip text encoder - all the same as what was used with the previous MultiTalk models for talking portrait videos.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4">Optimization Settings</h3>
                  <p className="text-slate-300 leading-relaxed">
                    By default, it uses the image to video LightX2V model to speed things up. You can lower the sampling steps to cut down generation time. For most setups, 480p resolution works well and is easier for everyone to run. Some people had trouble with 720p in earlier tests, so 480p should work for most setups.
                  </p>
                </div>
              </div>
            </section>

            {/* Advanced Features Section */}
            <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Advanced Features and Workflows
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Multiple People Support</h3>
                  <p className="text-slate-300 leading-relaxed">
                    InfiniteTalk supports multiple people and multiple audio inputs. This feature started with the original MultiTalk framework and InfiniteTalk keeps that same setup. You can input multiple audio tracks of people talking and assign reference target masks for the objects you want animated in the video.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Text-to-Speech Integration</h3>
                  <p className="text-slate-300 leading-relaxed">
                    You can integrate text-to-speech functionality using nodes like Chatterbox SRT voice. This allows you to either load generated content or type in your own text, then pass it to the text-to-speech node for automatic audio generation.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Long Content Generation</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Based on the example workflow, you can create additional workflows inspired by long content video generation ideas, such as creating podcast-style videos. The system calculates how long the video should be based on the generated audio.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Frame Interpolation</h3>
                  <p className="text-slate-300 leading-relaxed">
                    After generation, you can apply frame interpolation to double the FPS, which makes a big difference in smoothness. This helps fix minor issues like fast blinking or eye flickering that might occur during generation.
                  </p>
                </div>
              </div>
            </section>

            {/* Performance Section */}
            <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Performance and Quality Considerations
              </h2>
              
              <div className="space-y-8">
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4">Generation Quality</h3>
                  <p className="text-slate-300 leading-relaxed">
                    The generation comes out pretty smooth with no major glitches like we sometimes saw with MultiTalk. Back then, the character would sometimes overreact or make weird movements. With InfiniteTalk, it feels way more natural overall. After doubling the FPS with frame interpolation, the motions and lip syncing get even smoother.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4">Processing Method</h3>
                  <p className="text-slate-300 leading-relaxed">
                    During sampling, you'll see it processes the video in chunks. Each chunk is a few seconds long. For example, you can set it to 81 frames per chunk with 25 overlapping frames carried into the next chunk. That overlap is what keeps the animation smooth across the entire video.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-2xl font-bold text-white mb-4">Hardware Requirements</h3>
                  <p className="text-slate-300 leading-relaxed">
                    The exact requirements depend on your resolution and quality settings. For 480p generation, most modern GPUs with 6GB+ VRAM should work well. For 720p or longer videos, you'll need more VRAM and processing power.
                  </p>
                </div>
              </div>
            </section>

              {/* Comparison Section */}
              <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                How InfiniteTalk Improves on MultiTalk
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-green-900/20 rounded-xl p-6 border border-green-700/30">
                  <h3 className="text-2xl font-bold text-green-400 mb-4">InfiniteTalk Advantages</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Unlimited video length generation
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      More natural body language and head movements
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Better lip synchronization accuracy
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Reduced artifacts and distortions
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Improved stability for long videos
                    </li>
                  </ul>
                </div>

                <div className="bg-red-900/20 rounded-xl p-6 border border-red-700/30">
                  <h3 className="text-2xl font-bold text-red-400 mb-4">MultiTalk Limitations</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      Limited to short video clips
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      Sometimes overreacted or made weird movements
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      Less natural body language
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      More artifacts in longer sequences
                    </li>
                    <li className="flex items-center">
                      <span className="text-red-400 mr-2">•</span>
                      Inconsistent quality across video length
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Tips Section */}
            <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                Tips and Best Practices
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Audio Quality</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Use high-quality audio input for best results. The better the audio quality, the more accurate the lip synchronization and facial expressions will be. Clear speech without background noise works best.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Image Selection</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Choose clear, high-resolution images with good lighting for your talking avatar. The quality of the input image directly affects the quality of the generated video. Images with clear facial features work best.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Sampling Settings</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Start with lower sampling steps (4-8) for faster generation and testing. Increase the steps for higher quality when you're satisfied with the results. The default settings usually work well for most use cases.
                  </p>
                </div>

                <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
                  <h3 className="text-xl font-bold text-white mb-4">Post-Processing</h3>
                  <p className="text-slate-300 leading-relaxed">
                    Always apply frame interpolation after generation to double the FPS. This significantly improves the smoothness of the final video and reduces any flickering or artifacts that might occur during generation.
                  </p>
                </div>
              </div>
            </section>

            {/* Getting Started Section */}
            <section className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-8 md:p-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Getting Started
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  InfiniteTalk represents a significant advancement in talking avatar technology. With its unlimited-length generation capability and improved natural movements, it's currently the most up-to-date and best performing option available in the open-source space for portrait animation.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  The ComfyUI integration makes it accessible to users who prefer a visual workflow interface over command-line usage. The setup is pretty simple - just like MultiTalk, only now it's InfiniteTalk with the updated model loader.
                </p>
                <p className="text-slate-300 text-lg leading-relaxed">
                  Whether you're creating educational content, entertainment videos, or business presentations, InfiniteTalk provides the tools you need to create engaging talking avatar videos with natural expressions and movements that sync perfectly with your audio content.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
