import React from 'react';
import { Mic, Users, Palette, Monitor, Clock, Camera } from 'lucide-react';

export function Wans2vFeatures() {
  const features = [
    {
      icon: Mic,
      title: 'Audio-Driven Video Creation',
      description: 'Wan-S2V precisely follows speech and music, delivering lifelike lip-sync, eye focus, and expressive head and hand gestures.',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: Camera,
      title: 'Cinematic-Grade Visuals',
      description: 'With realistic skin, lighting, and motion, Wan-S2V delivers film-like visuals without complex setups.',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: Clock,
      title: 'Minute-Level Production',
      description: 'Unlike basic avatar tools, Wan-S2V supports longer sequences for lectures, product demos, and short films.',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
    },
    {
      icon: Users,
      title: 'Support for Full-Body and Half-Body',
      description: 'Capture close-ups or full-length shots—Wan-S2V keeps identity and motion stable.',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: Palette,
      title: 'Motion and Camera Control',
      description: 'The model interprets prompts like "slow dolly-in," "wave to camera," or "turn left and step forward" for intuitive direction.',
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200',
    },
    {
      icon: Monitor,
      title: 'Built for Creators',
      description: 'Trained on curated human-performance samples, the platform prioritizes clarity, realism, and consistency.',
      gradient: 'from-teal-500 to-cyan-500',
      bgGradient: 'from-teal-50 to-cyan-50',
      borderColor: 'border-teal-200',
    },
  ];

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-poppins">
            Why creators recommend Wan-S2V
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Experience cutting-edge AI that turns your images into cinematic video with natural motion
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12 shadow-[0_8px_24px_rgba(0,0,0,0.18)] text-center">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
            Ready to Transform Your Content?
          </h3>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of creators using Wan-S2V to create engaging cinematic AI videos for education, entertainment, and marketing.
          </p>
        </div>
      </div>
    </section>
  );
}
