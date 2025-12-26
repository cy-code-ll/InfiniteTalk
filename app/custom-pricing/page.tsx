import { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '../../components/Footer';
import { CTA } from '../../components/CTA';
import CustomPricingSection from './CustomPricingSection';

// SEO metadata
export const metadata: Metadata = {
  title: 'InfiniteTalk AI Custom Pricing - Enterprise Credit Plans',
  description: 'Discover InfiniteTalk AI custom pricing plans for enterprise customers. Large credit packages with best value per credit. Bulk processing available.',
  keywords: 'InfiniteTalk AI custom pricing, enterprise pricing, bulk credits, large credit packages, custom video generation pricing',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'InfiniteTalk AI Custom Pricing - Enterprise Credit Plans',
    description: 'Discover InfiniteTalk AI custom pricing plans for enterprise customers. Large credit packages with best value per credit.',
    url: 'https://www.infinitetalk.net/custom-pricing',
    siteName: 'InfiniteTalk AI',
    images: [
      {
        url: 'https://www.infinitetalk.net/og-custom-pricing.jpg',
        width: 1200,
        height: 630,
        alt: 'InfiniteTalk AI Custom Pricing Plans',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfiniteTalk AI Custom Pricing - Enterprise Credit Plans',
    description: 'Discover InfiniteTalk AI custom pricing plans for enterprise customers. Large credit packages with best value per credit.',
    images: ['https://www.infinitetalk.net/og-custom-pricing.jpg'],
  },
  alternates: {
    canonical: 'https://www.infinitetalk.net/custom-pricing',
  },
};

// JSON-LD structured data for custom pricing
const customPricingSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'InfiniteTalk AI Custom Pricing',
  description: 'Enterprise-level credit packages for AI-powered video generation with bulk processing capabilities',
  brand: {
    '@type': 'Brand',
    name: 'InfiniteTalk AI'
  },
  url: 'https://www.infinitetalk.net/custom-pricing',
  offers: [
    {
      '@type': 'Offer',
      name: 'Custom Plan 1',
      description: '44000 credits package with best value per credit',
      price: '1998',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
    },
    {
      '@type': 'Offer',
      name: 'Custom Plan 2',
      description: '66000 credits package with best value per credit',
      price: '2997',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
    },
    {
      '@type': 'Offer',
      name: 'Custom Plan 3',
      description: '110000 credits package with best value per credit',
      price: '4995',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
    }
  ]
};

export default function CustomPricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD structured data for custom pricing */}
      <Script id="ld-json-custom-pricing" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(customPricingSchemaData) }}
      />
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/custom-pricing#breadcrumb',
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
              name: 'Custom Pricing',
              item: 'https://www.infinitetalk.net/custom-pricing'
            }
          ]
        }) }}
      />
      
      <main className="flex-grow relative">
        {/* Fixed background gradient */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
        
        <CustomPricingSection />
      
      </main>
      
      {/* Footer without friendly links */}
      <Footer />
    </div>
  );
}

