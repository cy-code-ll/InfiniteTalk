'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function MultiFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "What is InfiniteTalk Multi?",
      answer: "InfiniteTalk Multi is an AI tool that generates multi-character conversations or duets from images and audio tracks."
    },
    {
      question: "How is it different from InfiniteTalk (single version)?",
      answer: "While InfiniteTalk focuses on single-character dubbing, InfiniteTalk Multi supports multi-character lip-sync for realistic interactions."
    },
    {
      question: "What inputs do I need?",
      answer: "One image per character and two separate audio files."
    },
    {
      question: "How accurate is lip-sync?",
      answer: "InfiniteTalk Multi uses advanced audio-driven dubbing to align lips, facial expressions, and gestures precisely."
    },
    {
      question: "What languages or voices are supported?",
      answer: "Any audio input—regardless of language, accent, or singing style—can be lip-synced."
    },
    {
      question: "Can I try InfiniteTalk Multi for free?",
      answer: "Yes. A free trial is available for short clips, with premium plans for longer or higher-quality outputs."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              InfiniteTalk Multi FAQ
            </h2>
            <p className="text-slate-300 text-lg">
              Common questions about multi-character lip-sync technology
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-xl border border-slate-700/50 backdrop-blur-sm">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/20 transition-colors rounded-xl"
                >
                  <h3 className="text-white font-semibold text-lg pr-4">
                    {faq.question}
                  </h3>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6">
                    <p className="text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
