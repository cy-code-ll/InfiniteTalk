import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Payment Success | InfiniteTalk',
  description: 'Your payment was successful. Start creating AI talking videos now with InfiniteTalk.',
  alternates: {
    canonical: '/payment-success',
  },
  openGraph: {
    title: 'Payment Success | InfiniteTalk',
    description: 'Payment completed successfully. Explore InfiniteTalk and start generating.',
    url: '/payment-success',
    siteName: 'InfiniteTalk',
  },
};

export default function PaymentSuccessPage() {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Payment Successful</h1>
        <p className="text-slate-300 mb-8">
          Thank you for your purchase. Your credits have been added to your account.
        </p>
        <Link href="/infinitetalk">
          <Button className="px-8">Go to InfiniteTalk</Button>
        </Link>
      </div>
    </section>
  );
}


