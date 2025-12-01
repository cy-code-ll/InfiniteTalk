import { Metadata } from 'next';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Refund Policy | InfiniteTalk AI',
  description: 'Read the Refund Policy for InfiniteTalk AI. Learn about our refund eligibility, request process, and terms.',
  alternates: {
    canonical: 'https://www.infinitetalk.net/refund',
  },
  openGraph: {
    title: 'Refund Policy | InfiniteTalk AI',
    description: 'Read the Refund Policy for InfiniteTalk AI. Learn about our refund eligibility, request process, and terms.',
    type: 'website',
    url: 'https://www.infinitetalk.net/refund',
  },
  twitter: {
    card: 'summary',
    title: 'Refund Policy | InfiniteTalk AI',
    description: 'Read the Refund Policy for InfiniteTalk AI.',
  },
};

export default function RefundPolicyPage() {
  return (
    <>
      <section className="max-w-4xl mx-auto px-6 py-26">
        <h1 className="text-4xl font-bold text-white mb-6">Refund Policy</h1>
        <p className="text-slate-400 mb-8">Effective Date: October 14, 2025</p>

        <p className="text-slate-300 mb-6">
          Thank you for using the AI services provided by InfiniteTalk. We hope you're satisfied with our products and services. If you'd like to request a refund, please review the following policy carefully.
        </p>

        <h2 className="text-2xl font-semibold text-white mb-3">1. Eligibility for Refunds</h2>
        <ul className="list-disc list-inside text-slate-300 mb-6 space-y-2">
          <li>You may request a refund within 7 days of purchase for any unused or partially unused service.</li>
          <li>If more than 20% of the purchased service credits or resources have been used, the order is not eligible for a full refund.</li>
          <li>Promotional offers, discounted packages, or special bundle deals may not be refundable. Please refer to the terms shown on the purchase page at the time of purchase.</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-3">2. How to Request a Refund</h2>
        <p className="text-slate-300 mb-3">Send your refund request to our customer support email.</p>
        <p className="text-slate-300 mb-3">We recommend using "Refund Request" as your email subject line.</p>
        <p className="text-slate-300 mb-3">Please include the following details in your message:</p>
        <ul className="list-disc list-inside text-slate-300 mb-6 space-y-2">
          <li>Your full name</li>
          <li>The email address associated with your account</li>
          <li>Order number or transaction ID</li>
          <li>Purchase date</li>
          <li>Reason for requesting a refund</li>
        </ul>
        <p className="text-slate-300 mb-3">Our support team will review your request within 2 business days.</p>
        <p className="text-slate-300 mb-6">If approved, the refund will be processed within 5–10 business days. The exact time may vary depending on your payment provider or bank.</p>

        <h2 className="text-2xl font-semibold text-white mb-3">3. Non-Refundable Situations</h2>
        <p className="text-slate-300 mb-3">Refunds will not be granted in the following cases:</p>
        <ul className="list-disc list-inside text-slate-300 mb-6 space-y-2">
          <li>More than 20% of the purchased resources have been used</li>
          <li>The order was placed more than 7 days ago</li>
          <li>The product was purchased through promotional offers, discounts, or bundles (unless otherwise stated on the purchase page)</li>
          <li>The refund request is related to a violation of our Terms of Service or misuse of the platform</li>
          <li>The same user submits multiple refund requests that are determined to be abnormal or abusive</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mb-3">4. Our Right to Refuse Refunds</h2>
        <p className="text-slate-300 mb-3">We reserve the right to deny or partially deny refund requests if:</p>
        <ul className="list-disc list-inside text-slate-300 mb-6 space-y-2">
          <li>Fraud or abuse is suspected</li>
          <li>There's a violation of our Terms of Service</li>
          <li>Multiple refund requests are submitted by the same user</li>
        </ul>
        <p className="text-slate-300 mb-6">If your refund request is denied, we'll notify you in writing and explain the reason.</p>

        <h2 className="text-2xl font-semibold text-white mb-3">5. Policy Updates</h2>
        <p className="text-slate-300 mb-6">This refund policy may be updated from time to time. If major changes occur, we'll post a clear notice on our website. Once published, the updated policy will take effect immediately.</p>

        <h2 className="text-2xl font-semibold text-white mb-3">6. Contact Us</h2>
        <p className="text-slate-300 mb-2">If you have any questions about this refund policy or wish to submit a request, please contact us at:</p>
        <div className="text-slate-200 font-medium">Customer Support Email:</div>
        <a href="mailto:support@infinitetalk.net" className="text-primary hover:text-primary/80">support@infinitetalk.net</a>
      </section>
      <Footer />
    </>
  );
}


