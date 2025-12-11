import { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '@/components/Footer';
import { Upload, Sparkles, Share2 } from 'lucide-react';
import { ChristmasHero } from '@/components/christmas/ChristmasHero';

// SEO metadata - T<60, D<160, K<100
export const metadata: Metadata = {
  title: 'Christmas Greeting Video Ideas | AI Video Generator',
  description: 'Create amazing Christmas greeting videos with AI. Generate personalized holiday video messages with lip-sync technology.',
  keywords: 'Christmas greeting video ideas, holiday video maker, AI Christmas videos, personalized videos',
  openGraph: {
    title: 'Christmas Greeting Video Ideas | AI Video Generator',
    description: 'Create amazing Christmas greeting videos with AI. Generate personalized holiday video messages with lip-sync technology.',
    url: 'https://www.infinitetalk.net/christmas',
    siteName: 'InfiniteTalk AI',
    images: [
      {
        url: 'https://www.infinitetalk.net/og-christmas.jpg',
        width: 1200,
        height: 630,
        alt: 'Christmas Greeting Video Ideas - AI Video Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Christmas Greeting Video Ideas | AI Video Generator',
    description: 'Create amazing Christmas greeting videos with AI. Generate personalized holiday video messages.',
    images: ['https://www.infinitetalk.net/og-christmas.jpg'],
  },
  alternates: {
    canonical: 'https://www.infinitetalk.net/christmas',
  },
};

// JSON-LD structured data
const christmasSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Christmas Greeting Video Ideas',
  description: 'Create amazing Christmas greeting videos with AI. Generate personalized holiday video messages with lip-sync technology.',
  url: 'https://www.infinitetalk.net/christmas',
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: 'InfiniteTalk AI - Christmas Video Generator',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
};

export default function ChristmasPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Breadcrumb structured data */}
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/christmas#breadcrumb',
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
              name: 'Christmas',
              item: 'https://www.infinitetalk.net/christmas'
            }
          ]
        }) }}
      />
      {/* JSON-LD structured data */}
      <Script id="ld-json-christmas" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(christmasSchemaData) }}
      />
      
      <main className="flex-grow relative">
        {/* Fixed background gradient */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
        
        {/* Hero Section - Different UI for mobile and desktop */}
        <ChristmasHero />
        
        {/* Additional sections can be added here */}
      </main>
      
      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}

