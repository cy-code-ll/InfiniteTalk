import { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.infinitetalk.net';

export const metadata: Metadata = {
  title: 'Payment Result - InfiniteTalk',
  description: 'View your payment result and order details on InfiniteTalk. Check your order status and start creating amazing AI videos.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Payment Result - InfiniteTalk',
    description: 'View your payment result and order details on InfiniteTalk.',
    type: 'website',
    url: `${siteUrl}/payment-result`,
  },
  twitter: {
    card: 'summary',
    title: 'Payment Result - InfiniteTalk',
    description: 'View your payment result and order details on InfiniteTalk.',
  },
};

export default function PaymentResultLayout({
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

