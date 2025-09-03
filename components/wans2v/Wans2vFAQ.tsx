'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function Wans2vFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'What is Wan-S2V?',
      answer: 'Wan-S2V is an AI video generation model that creates cinematic-quality videos from static images and audio.',
    },
    {
      question: 'How is Wan-S2V different from other AI video tools?',
      answer: 'Unlike basic avatar generators, Wan-S2V produces film-level visuals, complete with natural motion and professional camera effects.',
    },
    {
      question: 'What kind of videos can I make with Wan-S2V?',
      answer: 'You can generate dialogue videos, singing performances, dancing clips, or cinematic short films.',
    },
    {
      question: 'Does Wan-S2V support long-form videos?',
      answer: 'Yes, Wan-S2V enables minute-level video generation, far beyond typical short AI clips.',
    },
    {
      question: 'Who can use Wan-S2V?',
      answer: 'Filmmakers, content creators, educators, marketers, and anyone looking to create realistic AI-driven videos.',
    },
    {
      question: 'Is there a free trial for Wan-S2V?',
      answer: 'Yes. You can try Wan-S2V for free with short clips. For longer, higher-quality videos, premium plans are available.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-4xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-poppins">
            ❓ Wan-S2V FAQ
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Get answers to the most common questions about Wan-S2V
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
                         <div
               key={index}
               className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)]"
             >
               <button
                 onClick={() => toggleFAQ(index)}
                 className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/5 transition-colors duration-200 rounded-2xl"
               >
                 <h3 className="text-lg sm:text-xl font-semibold text-foreground pr-4">
                   {faq.question}
                 </h3>
                 <div className="flex-shrink-0">
                   {openIndex === index ? (
                     <ChevronUp className="h-6 w-6 text-muted-foreground" />
                   ) : (
                     <ChevronDown className="h-6 w-6 text-muted-foreground" />
                   )}
                 </div>
               </button>
               
               {openIndex === index && (
                 <div className="px-8 pb-6">
                   <div className="pt-2">
                     <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">
                       {faq.answer}
                     </p>
                   </div>
                 </div>
               )}
             </div>
          ))}
        </div>

                 {/* Additional Help */}
         <div className="mt-16 text-center">
           <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
             <h3 className="text-2xl font-bold mb-4 text-foreground">
               Still have questions?
             </h3>
             <p className="text-lg text-muted-foreground mb-6">
               Our support team is here to help you get the most out of Wan-S2V
             </p>
             <button className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200">
               Contact Support
             </button>
           </div>
         </div>
      </div>
    </section>
  );
}
