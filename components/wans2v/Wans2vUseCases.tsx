import React from 'react';
import { GraduationCap, ShoppingCart, Music, Film } from 'lucide-react';

export function Wans2vUseCases() {
  const useCases = [
    {
      icon: GraduationCap,
      title: 'Education & Training',
      description: 'Use Wan-S2V to present lessons, language practice, or expert explainers with engaging presence.',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      examples: ['Online Courses', 'Language Learning', 'Corporate Training', 'Tutorial Videos'],
    },
    {
      icon: ShoppingCart,
      title: 'Marketing & Product Demos',
      description: 'Showcase features with Wan-S2V while maintaining brand style and tone.',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      examples: ['Product Launches', 'Feature Demonstrations', 'Brand Campaigns', 'Social Media Ads'],
    },
    {
      icon: Music,
      title: 'Music & Performance',
      description: 'Animate album teasers or lyric scenes; Wan-S2V matches rhythm and emotion.',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      examples: ['Music Videos', 'Album Teasers', 'Lyric Visualizations', 'Performance Clips'],
    },
    {
      icon: Film,
      title: 'Short Films & Social Clips',
      description: 'Build dramatic beats and expressive performances—Wan-S2V keeps continuity shot to shot.',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      examples: ['Short Films', 'Social Media Content', 'Storytelling', 'Character Development'],
    },
  ];


  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-poppins">
            What you can create with Wan-S2V
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover how AI video opens up new possibilities across industries and creative fields
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {useCases.map((useCase, index) => {
            const IconComponent = useCase.icon;
            return (
                             <div
                 key={index}
                 className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-2 group"
               >
                 {/* Icon */}
                 <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                   <IconComponent className="w-8 h-8 text-white" />
                 </div>
                 
                 {/* Title & Description */}
                 <h3 className="text-2xl font-bold text-foreground mb-4">
                   {useCase.title}
                 </h3>
                 
                 <p className="text-muted-foreground leading-relaxed mb-6">
                   {useCase.description}
                 </p>

                 {/* Examples */}
                 <div className="space-y-2">
                   <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                     Examples:
                   </div>
                   <div className="flex flex-wrap gap-2">
                     {useCase.examples.map((example, exampleIndex) => (
                       <span
                         key={exampleIndex}
                         className="inline-block bg-white/10 text-foreground px-3 py-1 rounded-full text-sm font-medium border border-white/20"
                       >
                         {example}
                       </span>
                     ))}
                   </div>
                 </div>
               </div>
            );
          })}
        </div>

                 {/* Bottom CTA */}
         <div className="mt-16 text-center">
           <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 sm:p-12 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
             <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
               Ready to Explore Your Creative Potential?
             </h3>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Start creating professional videos in any of these categories with Wan-S2V's powerful AI technology
            </p>
            <a 
              href="#wans2v-hero"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors duration-200"
            >
              Start Creating Now
            </a>
           </div>
         </div>
      </div>
    </section>
  );
}
