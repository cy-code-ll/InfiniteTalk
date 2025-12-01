import { GoogleOneTapAuth } from '../components/auth';
import { Footer } from '../components/Footer';
import { CTA } from '../components/CTA';
import { 
  Hero, 
  KeyFeatures, 
  QuickInferenceTips, 
  UseCases, 
  Comparisons, 
  TechHighlights, 
  GettingStarted,
  FAQs,
  VideoCases,
} from '../components/home/server';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { schemaData } from '../lib/seo-config';

// Client island - dynamically imported for code splitting
const PricingSection = dynamic(() => import('../components/home/client').then(m => ({ default: m.PricingSection })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100/5 rounded-lg" />,
});

// Enable ISR - revalidate every 20 minutes
export const revalidate = 1200;

export default async function Home() {

  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD structured data */}
      <Script id="ld-json-site" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <Script id="ld-json-faq" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          name: 'InfiniteTalk AI - Frequently Asked Questions',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is InfiniteTalk AI?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'InfiniteTalk AI is an advanced model for audio-driven video generation, enabling lip-synced and body-synced animations beyond traditional dubbing.'
              }
            },
            {
              '@type': 'Question',
              name: 'How does InfiniteTalk AI differ from traditional dubbing?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Conventional dubbing edits only the mouth. InfiniteTalk AI edits the whole frame, synchronizing lips, expressions, head motion, and gestures for natural results.'
              }
            },
            {
              '@type': 'Question',
              name: 'What inputs does InfiniteTalk AI support?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Provide either a video + audio (video-to-video) or a single image + audio (image-to-video).'
              }
            },
            {
              '@type': 'Question',
              name: 'How long can videos generated with InfiniteTalk AI be?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'InfiniteTalk AI supports unlimited-length generation for long-form content.'
              }
            },
            {
              '@type': 'Question',
              name: 'What resolutions are available in InfiniteTalk AI?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'InfiniteTalk AI currently supports 480p and 720p outputs, with higher resolutions planned.'
              }
            },
            {
              '@type': 'Question',
              name: 'Is InfiniteTalk AI free to use?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'InfiniteTalk AI offers free research access and premium SaaS options. Free users can try short clips; paid tiers unlock longer, higher-quality exports.'
              }
            }
          ]
        }) }}
      />
      <Script id="ld-json-howitworks" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'HowTo',
          name: 'How to Use InfiniteTalk AI',
          description: 'Learn how to create infinite-length talking videos with InfiniteTalk AI in three simple steps.',
          image: 'https://www.infinitetalk.net/og-image.jpg',
          totalTime: 'PT5M',
          estimatedCost: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: '0'
          },
          supply: [
            {
              '@type': 'HowToSupply',
              name: 'Video or Image Source'
            },
            {
              '@type': 'HowToSupply',
              name: 'Audio File'
            }
          ],
          tool: [
            {
              '@type': 'SoftwareApplication',
              name: 'InfiniteTalk AI',
              url: 'https://www.infinitetalk.net'
            }
          ],
          step: [
            {
              '@type': 'HowToStep',
              name: 'Upload Source & Audio',
              text: 'Choose a video or image and upload your speech, podcast, or dialogue to dub with InfiniteTalk AI.',
              url: 'https://www.infinitetalk.net#step1',
              image: 'https://www.infinitetalk.net/step1.jpg'
            },
            {
              '@type': 'HowToStep',
              name: 'Generate with InfiniteTalk AI',
              text: 'Instantly produce a lip‑synced, full‑body animated video using InfiniteTalk AI.',
              url: 'https://www.infinitetalk.net#step2',
              image: 'https://www.infinitetalk.net/step2.jpg'
            },
            {
              '@type': 'HowToStep',
              name: 'Export & Share',
              text: 'Download in 480p/720p and share anywhere. Created with InfiniteTalk AI.',
              url: 'https://www.infinitetalk.net#step3',
              image: 'https://www.infinitetalk.net/step3.jpg'
            }
          ]
        }) }}
      />
      
      {/* Google One Tap Auth - only shown when user is not signed in */}
      <GoogleOneTapAuth
        cancelOnTapOutside={true}
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/"
      />
      
      <main className="flex-grow relative">
        {/* Fixed background gradient with project's primary color */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        {/* Additional gradient overlay for more depth */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
        
        {/* Server Components - rendered on server */}
        <Hero />
        <GettingStarted />
        <VideoCases />
        <KeyFeatures />
        {/* Server Components */}
        {/* <WhatIsIt />
        <WhySparseFrame /> */}
      
        {/* <HowItWorks /> */}
        <QuickInferenceTips />
        <UseCases />
        <Comparisons />
        <TechHighlights />
        
        {/* Client island: PricingSection - uses Clerk hooks */}
        <PricingSection />
        
        {/* Server Components */}
        <FAQs />
        <CTA />
      </main>
      
      {/* Server Component: Footer */}
      <Footer />
    </div>
  );
}
