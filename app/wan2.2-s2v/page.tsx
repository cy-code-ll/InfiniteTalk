import type { Metadata } from 'next';
import Script from 'next/script';
import { Wans2vHero } from '@/components/wans2v/Wans2vHero';
import { Wans2vFeatures } from '@/components/wans2v/Wans2vFeatures';
import { Wans2vHowToUse } from '@/components/wans2v/Wans2vHowToUse';
import { Wans2vTestimonials } from '@/components/wans2v/Wans2vTestimonials';
import { Wans2vCaseStudies } from '@/components/wans2v/Wans2vCaseStudies';
import { Wans2vUseCases } from '@/components/wans2v/Wans2vUseCases';
import { Wans2vTips } from '@/components/wans2v/Wans2vTips';
import { Wans2vFAQ } from '@/components/wans2v/Wans2vFAQ';
import { Wans2vCTA } from '@/components/wans2v/Wans2vCTA';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Wan-S2V-Audio-Driven Cinematic Al Video Generation',
  description: 'Wan-S2V transforms images and audio into cinematic Al videos with natural expressions, body motion,and professional camera effects. Perfect for creators and filmmakers.',
  keywords: 'Wan-S2V, AI video, cinematic generation, motion control, digital human',
  alternates: {
    canonical: 'https://www.infinitetalk.net/wan2.2-s2v',
  },
  openGraph: {
    title: 'Wan-S2V-Audio-Driven Cinematic Al Video Generation',
    description: 'Wan-S2V transforms images and audio into cinematic Al videos with natural expressions, body motion,and professional camera effects. Perfect for creators and filmmakers.',
    type: 'website',
    url: 'https://www.infinitetalk.net/wan2.2-s2v',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wan-S2V-Audio-Driven Cinematic Al Video Generation',
    description: 'Wan-S2V transforms images and audio into cinematic Al videos with natural expressions, body motion,and professional camera effects. Perfect for creators and filmmakers.',
  },
};

export default function Wans2vPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Wan-S2V',
    description:
      'Create cinematic AI videos from images and audio with natural motion and professional effects.',
    keywords:
      'Wan-S2V, AI video, cinematic generation, motion control, digital human',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    softwareVersion: '2.2',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      description: 'Free trial with premium plans for longer videos',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Wan AI',
      url: 'https://www.infinitetalk.net/wan2.2-s2v',
    },
    featureList: [
      'Audio-driven video generation',
      'Cinematic-grade quality',
      'Minute-level creation',
      'Full-body and half-body support',
      'Motion and camera control',
      'Professional camera effects'
    ],
    audience: {
      '@type': 'Audience',
      audienceType: 'Content creators, filmmakers, educators, marketers'
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Fixed background gradient with project's primary color */}
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
      {/* Additional gradient overlay for more depth */}
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
      
      <Script id="ld-json-wans2v" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/wan2.2-s2v#breadcrumb',
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
              name: 'WAN2.2 S2V',
              item: 'https://www.infinitetalk.net/wan2.2-s2v'
            }
          ]
        }) }}
      />
      <main className="pt-30">
        <Wans2vHero />
        <Wans2vHowToUse />
        <Wans2vFeatures />
        <Wans2vTestimonials />
        <Wans2vCaseStudies />
        <Wans2vUseCases />
        <Wans2vTips />
        <Wans2vFAQ />
        <Wans2vCTA />
      </main>
      <Footer />
    </div>
  );
}
