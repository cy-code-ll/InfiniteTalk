'use client';

import React from 'react';
import { Upload, Zap, Share2, Camera } from 'lucide-react';

export function Wans2vHowToUse() {
  const steps = [
    {
      icon: Upload,
      title: 'Upload an Image',
      description: 'Choose a portrait, half-body, or full-body photo. Wan-S2V preserves identity, lighting, and styling for consistent results.',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      step: '01',
    },
    {
      icon: Zap,
      title: 'Add Audio',
      description: 'Upload dialogue, narration, or singing. Wan-S2V aligns lip-sync, facial nuance, and body rhythm to the audio.',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      step: '02',
    },
    {
      icon: Camera,
      title: 'Customize Motion',
      description: 'Use short text prompts to guide gestures, poses, actions, and camera angles. The engine interprets creative direction while keeping realism intact.',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      step: '03',
    },
    {
      icon: Share2,
      title: 'Generate',
      description: 'Click create and let Wan-S2V produce a share-ready, cinematic video you can download or post immediately.',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      step: '04',
    },
  ];

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-poppins">
            🚀 How to use Wan-S2V
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Turn images and audio into cinematic AI video in just minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="relative mb-20">
          {/* Connection Line for Desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 transform -translate-y-1/2 z-0 opacity-60"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg z-20 border-4 border-white">
                    {step.step}
                  </div>

                                     {/* Card */}
                   <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 lg:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-2 group h-full">
                     <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                       <IconComponent className="w-8 h-8 text-white" />
                     </div>
                     
                     <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-4 leading-tight">
                       {step.title}
                     </h3>
                     
                     <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">
                       {step.description}
                     </p>
                   </div>
                </div>
              );
            })}
          </div>
        </div>

   
      </div>
    </section>
  );
}
