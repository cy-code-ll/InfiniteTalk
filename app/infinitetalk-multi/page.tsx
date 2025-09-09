import { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '../../components/Footer';
import { MultiHero, MultiHowToUse, MultiFeatures, MultiUseCases, MultiCaseStudies, MultiFAQ } from '../../components/multi';

// SEO metadata
export const metadata: Metadata = {
  title: 'InfiniteTalk Multi – Multi-Character AI Lip-Sync',
  description: 'Create realistic multi-character conversations with AI lip-sync. Generate talking videos from one image and two audio inputs. Perfect for podcasts & education.',
  keywords: 'InfiniteTalk Multi, multi-character lip-sync, AI video generator, conversational videos',
  openGraph: {
    title: 'InfiniteTalk Multi – Multi-Character AI Lip-Sync',
    description: 'Create realistic multi-character conversations with AI lip-sync. Generate talking videos from one image and two audio inputs. Perfect for podcasts & education.',
    url: 'https://www.infinitetalk.net/infinitetalk-multi',
    siteName: 'InfiniteTalk AI',
    images: [
      {
        url: 'https://www.infinitetalk.net/og-infinitetalk-multi.jpg',
        width: 1200,
        height: 630,
        alt: 'InfiniteTalk Multi - Multi-Character AI Lip-Sync Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfiniteTalk Multi – Multi-Character AI Lip-Sync',
    description: 'Create realistic multi-character conversations with AI lip-sync. Generate talking videos from one image and two audio inputs.',
    images: ['https://www.infinitetalk.net/og-infinitetalk-multi.jpg'],
  },
  alternates: {
    canonical: 'https://www.infinitetalk.net/infinitetalk-multi',
  },
};

// JSON-LD structured data
const infiniteTalkMultiSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'InfiniteTalk Multi',
  description: 'Advanced AI tool for generating multi-character conversations and duets with realistic lip-sync technology',
  url: 'https://www.infinitetalk.net/infinitetalk-multi',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free trial available with premium plans'
  },
  creator: {
    '@type': 'Organization',
    name: 'InfiniteTalk AI'
  },
  featureList: [
    'Multi-character lip synchronization',
    'Two-speaker support',
    'Audio-driven animation',
    'Identity preservation',
    'Image-to-video generation',
    'Real-time conversation creation'
  ],
  audience: {
    '@type': 'Audience',
    audienceType: 'Content creators, educators, podcasters, entertainers'
  }
};

// How-to structured data
const howToSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use InfiniteTalk Multi',
  description: 'Step-by-step guide to create multi-character conversations with InfiniteTalk Multi',
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
      name: 'Two separate audio files'
    }
  ],
  tool: [
    {
      '@type': 'SoftwareApplication',
      name: 'InfiniteTalk Multi',
      url: 'https://www.infinitetalk.net/infinitetalk-multi'
    }
  ],
  step: [
    {
      '@type': 'HowToStep',
      name: 'Upload an Image',
      text: 'Upload a clear image of a person\'s face to the InfiniteTalk Multi platform.',
      url: 'https://www.infinitetalk.net/infinitetalk-multi#step1'
    },
    {
      '@type': 'HowToStep', 
      name: 'Add Audio',
      text: 'Input two separate voice tracks or songs for the multi-character conversation.',
      url: 'https://www.infinitetalk.net/infinitetalk-multi#step2'
    },
    {
      '@type': 'HowToStep',
      name: 'Generate',
      text: 'Click Generate and InfiniteTalk Multi will sync lips, expressions, and body motion for both speakers.',
      url: 'https://www.infinitetalk.net/infinitetalk-multi#step3'
    },
    {
      '@type': 'HowToStep',
      name: 'Export & Share',
      text: 'Download your conversational video in minutes and share anywhere.',
      url: 'https://www.infinitetalk.net/infinitetalk-multi#step4'
    }
  ]
};

// FAQ structured data
const faqSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is InfiniteTalk Multi?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'InfiniteTalk Multi is an AI tool that generates multi-character conversations or duets from images and audio tracks.'
      }
    },
    {
      '@type': 'Question',
      name: 'How is it different from InfiniteTalk (single version)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'While InfiniteTalk focuses on single-character dubbing, InfiniteTalk Multi supports multi-character lip-sync for realistic interactions.'
      }
    },
    {
      '@type': 'Question',
      name: 'What inputs do I need?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'One image per character and two separate audio files.'
      }
    },
    {
      '@type': 'Question',
      name: 'How accurate is lip-sync?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'InfiniteTalk Multi uses advanced audio-driven dubbing to align lips, facial expressions, and gestures precisely.'
      }
    },
    {
      '@type': 'Question',
      name: 'What languages or voices are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any audio input—regardless of language, accent, or singing style—can be lip-synced.'
      }
    },
    {
      '@type': 'Question',
      name: 'Can I try InfiniteTalk Multi for free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. A free trial is available for short clips, with premium plans for longer or higher-quality outputs.'
      }
    }
  ]
};

export default function InfiniteTalkMultiPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD structured data */}
      <Script id="ld-json-infinitetalk-multi" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(infiniteTalkMultiSchemaData) }}
      />
      <Script id="ld-json-howto-multi" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchemaData) }}
      />
      <Script id="ld-json-faq-multi" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
      />
      
      <main className="flex-grow relative">
        {/* Fixed background gradient */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
        
        <MultiHero />
        <MultiCaseStudies />
        <MultiHowToUse />
        <MultiFeatures />
        <MultiUseCases />
        <MultiFAQ />
      </main>
      
      {/* Footer without friendly links */}
      <Footer />
    </div>
  );
}
