'use client';

import React from 'react';
import { Lightbulb, Camera, Mic, Edit3, Clock, Download } from 'lucide-react';

export function Wans2vTips() {
  const tips = [
    {
      icon: Camera,
      title: 'Clear Photo Setup',
      description: 'Start with a clear, well-lit photo where the subject\'s face is unobstructed so Wan-S2V can capture micro-expressions.',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: Mic,
      title: 'Clean Audio Quality',
      description: 'Use clean audio without background noise; Wan-S2V tracks timing and emphasis from your voice.',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: Edit3,
      title: 'Concise Prompts',
      description: 'Be concise with prompts—give Wan-S2V one action per sentence for sharper control.',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
    },
    {
      icon: Clock,
      title: 'Sectioned Content',
      description: 'For minute-level videos, break content into sections; Wan-S2V maintains flow while you iterate quickly.',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: Download,
      title: 'Export Resolution',
      description: 'Export at the resolution you need; Wan-S2V makes it easy to deliver for web, social, or presentations.',
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200',
    },
  ];

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary to-primary/70 rounded-full mb-6">
            <Lightbulb className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-poppins">
            Tips to get the best out of Wan-S2V
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Follow these best practices to craft stunning, professional videos with Wan-S2V
          </p>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tips.map((tip, index) => {
            const IconComponent = tip.icon;
            return (
                             <div
                 key={index}
                 className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-2 group"
               >
                 <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                   <IconComponent className="w-8 h-8 text-white" />
                 </div>
                 
                 <h3 className="text-xl font-bold text-foreground mb-4">
                   {tip.title}
                 </h3>
                 
                 <p className="text-muted-foreground leading-relaxed">
                   {tip.description}
                 </p>
               </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12 shadow-[0_8px_24px_rgba(0,0,0,0.18)] text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            Ready to Create Amazing Videos?
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Apply these tips and unlock the full potential of Wan-S2V for your creative projects
          </p>
        </div>
      </div>
    </section>
  );
}
