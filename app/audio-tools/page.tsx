import { Metadata } from 'next';
import Script from 'next/script';
import AudioToolsPage from './AudioToolsPage';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Audio Tools - Infinite Talk AI | Audio Editing & Video Audio Extraction',
  description: 'Professional audio editing tools from Infinite Talk AI. Cut, trim, and edit audio files with precision. Extract audio from video files seamlessly.',
  keywords: ['Infinite Talk AI', 'Audio tools', 'Audio editing', 'Audio cutter', 'Video audio extraction', 'Audio trimmer', 'MP3 editor', 'WAV editor'],
  alternates: {
    canonical: 'https://www.infinitetalk.net/audio-tools',
  },
  openGraph: {
    title: 'Audio Tools - Infinite Talk AI',
    description: 'Professional audio editing tools. Cut, trim, and edit audio files with precision. Extract audio from video files seamlessly.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Audio Tools - Infinite Talk AI',
    description: 'Professional audio editing tools. Cut, trim, and edit audio files with precision. Extract audio from video files seamlessly.',
  },
};

export default function AudioTools() {
  return (
    <>
      <Script id="ld-json-breadcrumb" type="application/ld+json" strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          '@id': 'https://www.infinitetalk.net/audio-tools#breadcrumb',
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
              name: 'Audio Tools',
              item: 'https://www.infinitetalk.net/audio-tools'
            }
          ]
        }) }}
      />
      <AudioToolsPage />
      <Footer />
    </>
  );
}
