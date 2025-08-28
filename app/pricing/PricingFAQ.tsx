'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First item open by default

  const faqItems: FAQItem[] = [
    {
      question: 'Is this a monthly subscription service?',
      answer: 'We offer both one-time purchases and monthly subscriptions. One-time purchases never expire, while subscriptions provide fresh credits every month.'
    },
    {
      question: 'Do credits expire monthly?',
      answer: 'One-time purchase credits never expire. Subscription credits are refreshed monthly and do not carry over to the next month.'
    },
    {
      question: 'What are credits?',
      answer: 'Credits are used to generate videos and images. Different features consume different amounts of credits based on complexity.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'Currently, we accept Visa, Mastercard, American Express, Discover, Japan Credit Bureau (JCB) and other credit cards.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900/30 to-slate-950/50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left side - Title */}
          <div className="lg:sticky lg:top-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Pricing FAQ
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Get answers to common questions about InfiniteTalk AI pricing, subscriptions, and payment options.
            </p>
            <div className="hidden lg:block">
              <div className="bg-gradient-to-r from-primary/20 to-transparent h-1 w-24 mb-4"></div>
              <p className="text-slate-400">
                Still have questions? Contact our support team for personalized assistance.
              </p>
            </div>
          </div>

          {/* Right side - FAQ Items */}
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-xl border border-slate-700/50 backdrop-blur-sm"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-700/30 transition-all duration-200 rounded-xl"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>
                
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-6 pb-5">
                    <div className="h-px bg-gradient-to-r from-slate-600/50 to-transparent mb-4"></div>
                    <p className="text-slate-300 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Contact support card */}
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
              <h3 className="text-lg font-semibold text-white mb-2">
                Need more help?
              </h3>
              <p className="text-slate-300 mb-4">
                Our support team is ready to assist you with any questions about pricing or features.
              </p>
              <a
                href="mailto:support@infinitetalk.net"
                className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 
