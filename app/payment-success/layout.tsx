import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.infinitetalk.net';

export const metadata: Metadata = {
  title: 'Payment Success - InfiniteTalk',
  description: 'Your payment was successful! Your credits have been added to your account. Start creating amazing AI videos now.',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: `${siteUrl}/payment-success`,
  },
  openGraph: {
    title: 'Payment Success - InfiniteTalk',
    description: 'Your payment was successful! Your credits have been added to your account.',
    type: 'website',
    url: `${siteUrl}/payment-success`,
  },
  twitter: {
    card: 'summary',
    title: 'Payment Success - InfiniteTalk',
    description: 'Your payment was successful!',
  },
};

export default function PaymentSuccessLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
    </>
  );
}

