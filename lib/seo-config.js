const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.seedancepro.com';

export const metadata = {
  title: 'Seedance Pro - AI Video Generator & Creator Tool',
  description: 'Create stunning videos with Seedance Pro AI video generator. Transform text and images into professional videos effortlessly.',
  keywords: ['seedance pro', 'AI video generator', 'video creator', 'text to video', 'AI video maker'],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Seedance Pro – AI Video Generator | Professional Video Creation Tool',
    description: 'Professional Seedance Pro AI video generator for creating stunning videos with advanced AI technology. Transform your ideas into high-quality video content effortlessly.',
    url: siteUrl,
    siteName: 'Seedance Pro',
    images: [
      {
        url: `${siteUrl}/og-img.png`,
        width: 1200,
        height: 630,
        alt: 'Seedance Pro - AI Video Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seedance Pro – AI Video Generator | Professional Video Creation Tool',
    description: 'Professional Seedance Pro AI video generator for creating stunning videos with advanced AI technology. Transform your ideas into high-quality video content effortlessly.',
    images: [`${siteUrl}/og-img.png`],
  },
};

export const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Seedance Pro",
      "url": siteUrl,
      "description": "Professional AI video generation platform"
    },
    {
      "@type": "WebSite",
      "name": "Seedance Pro",
      "url": siteUrl,
      "description": "Advanced AI video creation platform",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Seedance Pro",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web Browser",
      "description": "Professional AI video generator for creating high-quality video content",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export { siteUrl }; 