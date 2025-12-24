import { Metadata } from 'next';
import Script from 'next/script';
import { Footer } from '../../components/Footer';
import { CTA } from '../../components/CTA';
import PaypalPricingSection from './paypalPricingSection';

// SEO metadata
export const metadata: Metadata = {
  title: 'InfiniteTalk AI PayPal Pricing - Enterprise Credit Plans',
  description: 'Discover InfiniteTalk AI PayPal pricing plans for enterprise customers. Large credit packages with best value per credit. Bulk processing available.',
  keywords: 'InfiniteTalk AI PayPal pricing, enterprise pricing, bulk credits, large credit packages, PayPal video generation pricing',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: 'InfiniteTalk AI PayPal Pricing - Enterprise Credit Plans',
    description: 'Discover InfiniteTalk AI PayPal pricing plans for enterprise customers. Large credit packages with best value per credit.',
    url: 'https://www.infinitetalk.net/paypal-pricing',
    siteName: 'InfiniteTalk AI',
    images: [
      {
        url: 'https://www.infinitetalk.net/og-paypal-pricing.jpg',
        width: 1200,
        height: 630,
        alt: 'InfiniteTalk AI PayPal Pricing Plans',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InfiniteTalk AI PayPal Pricing - Enterprise Credit Plans',
    description: 'Discover InfiniteTalk AI PayPal pricing plans for enterprise customers. Large credit packages with best value per credit.',
    images: ['https://www.infinitetalk.net/og-paypal-pricing.jpg'],
  },
  alternates: {
    canonical: 'https://www.infinitetalk.net/paypal-pricing',
  },
};

// JSON-LD structured data for PayPal pricing
const paypalPricingSchemaData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'InfiniteTalk AI PayPal Pricing',
  description: 'Enterprise-level credit packages for AI-powered video generation with bulk processing capabilities',
  brand: {
    '@type': 'Brand',
    name: 'InfiniteTalk AI'
  },
  url: 'https://www.infinitetalk.net/paypal-pricing',
  offers: [
    {
      '@type': 'Offer',
      name: 'PayPal Plan 1',
      description: '44000 credits package with best value per credit',
      price: '1998',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
    },
    {
      '@type': 'Offer',
      name: 'PayPal Plan 2',
      description: '66000 credits package with best value per credit',
      price: '2997',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
    },
    {
      '@type': 'Offer',
      name: 'PayPal Plan 3',
      description: '110000 credits package with best value per credit',
      price: '4995',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      validFrom: '2025-01-01',
    }
  ]
};

export default function PaypalPricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* JSON-LD structured data for PayPal pricing */}
      <Script id="ld-json-paypal-pricing" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(paypalPricingSchemaData) }}
      />
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/paypal-pricing#breadcrumb',
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
              name: 'PayPal Pricing',
              item: 'https://www.infinitetalk.net/paypal-pricing'
            }
          ]
        }) }}
      />
      
      <main className="flex-grow relative">
        {/* Fixed background gradient */}
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-background via-primary/10 via-primary/20 via-primary/15 to-slate-950 -z-10" />
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-tl from-transparent via-primary/5 to-transparent -z-10" />
        
        <PaypalPricingSection />
      
      </main>
      
      {/* Footer without friendly links */}
      <Footer />
    </div>
  );
}

