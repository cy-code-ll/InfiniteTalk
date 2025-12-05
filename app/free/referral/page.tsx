import type { Metadata } from 'next';
import Script from 'next/script';
import { siteUrl } from '@/lib/seo-config';
import dynamic from 'next/dynamic';
import {Footer} from '@/components/Footer';

const PromotionClient = dynamic(() => import('./PromotionClient'), { ssr: true });

export const metadata: Metadata = {
  title: 'Infinite Talk AI Video Generator for Free By Referral',
  description: 'Share your referral link and earn credits when friends join Infinite Talk AI.',
  alternates: { canonical: `${siteUrl}/referral` },
  openGraph: {
    title: 'Infinite Talk AI Video Generator for Free By Referral',
    description: 'Invite friends and earn credits on Infinite Talk AI.',
    url: `${siteUrl}/referral`,
    siteName: 'Infinite Talk AI',
    images: [{ url: `${siteUrl}/og-img.png`, width: 1200, height: 630, alt: 'Infinite Talk AI' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infinite Talk AI Video Generator for Free By Referral',
    description: 'Invite friends and earn credits on Infinite Talk AI.',
    images: [`${siteUrl}/og-img.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PromotionPage() {
  return (
    <>
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/free/referral#breadcrumb',
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
              name: 'Referral',
              item: 'https://www.infinitetalk.net/free/referral'
            }
          ]
        }) }}
      />
      <PromotionClient />
      <Footer />
    </>
  );
}


