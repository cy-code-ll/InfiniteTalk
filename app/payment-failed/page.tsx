import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Payment Failed | InfiniteTalk',
  description: 'Your payment could not be completed. Please try again or contact support.',
  alternates: {
    canonical: 'https://www.infinitetalk.net/payment-failed',
  },
  openGraph: {
    title: 'Payment Failed | InfiniteTalk',
    description: 'Payment failed. Retry checkout or contact support.',
    url: '/payment-failed',
    siteName: 'InfiniteTalk',
  },
};

export default function PaymentFailedPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Payment Failed</h1>
        <p className="text-slate-300 mb-8">
          We could not process your payment. Please try again, or contact support if the issue persists.
        </p>
        <Link href="/infinitetalk">
          <Button className="px-8">Back to InfiniteTalk</Button>
        </Link>
      </div>
    </section>
  );
}


