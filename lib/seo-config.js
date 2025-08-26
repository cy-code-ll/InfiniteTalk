const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.infinitetalk.net';

export const metadata = {
  title: 'Infinite Talk AI | Sparse-Frame, Audio-Driven Video Dubbing',
  description: 'Infinite Talk AI: audio-driven full-body video dubbing that preserves identity and camera motion, with sparse-frame control and long-sequence image-to-video.',
  keywords: ['Infinite Talk AI', 'sparse-frame video dubbing', 'audio-driven animation', 'image-to-video', 'keyframes'],
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
    title: 'Infinite Talk AI | Sparse-Frame, Audio-Driven Video Dubbing',
    description: 'Infinite Talk AI: audio-driven full-body video dubbing that preserves identity and camera motion, with sparse-frame control and long-sequence image-to-video.',
    url: siteUrl,
    siteName: 'Infinite Talk AI',
    images: [
      {
        url: `${siteUrl}/og-img.png`,
        width: 1200,
        height: 630,
        alt: 'Infinite Talk AI - AI Video Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Infinite Talk AI | Sparse-Frame, Audio-Driven Video Dubbing',
    description: 'Infinite Talk AI: audio-driven full-body video dubbing that preserves identity and camera motion, with sparse-frame control and long-sequence image-to-video.',
    images: [`${siteUrl}/og-img.png`],
  },
};

export const schemaData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "name": "Infinite Talk AI",
      "url": siteUrl,
      "description": "Audio-driven full-body video dubbing platform with sparse-frame control"
    },
    {
      "@type": "WebSite",
      "name": "Infinite Talk AI",
      "url": siteUrl,
      "description": "Advanced audio-driven video dubbing platform with sparse-frame control",
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteUrl}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SoftwareApplication",
      "name": "Infinite Talk AI",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web Browser",
      "description": "Audio-driven full-body video dubbing with sparse-frame control and long-sequence image-to-video generation",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ]
};

export { siteUrl }; 