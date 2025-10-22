import React from 'react';
import { Star, Quote } from 'lucide-react';

export function Wans2vTestimonials() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Chen',
      role: 'Content Creator',
      company: 'Digital Studios',
      avatar: 'https://picsum.photos/80/80?random=1',
      rating: 5,
      content: 'Wan-S2V has revolutionized my content creation process. The cinematic quality and natural motion are incredible. I can now create professional videos in minutes instead of hours.',
      videoType: 'Educational Content',
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      role: 'Filmmaker',
      company: 'Indie Productions',
      avatar: 'https://picsum.photos/80/80?random=2',
      rating: 5,
      content: 'As a filmmaker, I was skeptical about AI-generated content, but Wan-S2V delivers film-grade visuals. The camera control and motion customization are game-changers for indie productions.',
      videoType: 'Short Films',
    },
    {
      id: 3,
      name: 'Emma Thompson',
      role: 'Marketing Director',
      company: 'TechCorp',
      avatar: 'https://picsum.photos/80/80?random=3',
      rating: 5,
      content: 'We use Wan-S2V for all our product demos and marketing videos. The quality is professional, and our audience engagement has increased significantly. It\'s like having a full production team.',
      videoType: 'Marketing Videos',
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-poppins">
            💬 What creators are saying
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of satisfied creators who have transformed their content using Wan-S2V
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((testimonial) => (
                         <div
               key={testimonial.id}
               className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:-translate-y-2 group"
             >
              {/* Quote Icon */}
              <div className="mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Quote className="w-6 h-6 text-white" />
                </div>
              </div>

                             {/* Rating */}
               <div className="flex items-center mb-4">
                 {renderStars(testimonial.rating)}
                 <span className="ml-2 text-sm text-muted-foreground">
                   {testimonial.rating}.0 out of 5
                 </span>
               </div>

               {/* Content */}
               <blockquote className="text-foreground leading-relaxed mb-6 text-base">
                 "{testimonial.content}"
               </blockquote>

               {/* Video Type Badge */}
               <div className="mb-6">
                 <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium border border-primary/20">
                   {testimonial.videoType}
                 </span>
               </div>

               {/* User Info */}
               <div className="flex items-center">
                 <img
                   src={testimonial.avatar}
                   alt={`${testimonial.name} avatar`}
                   className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                 />
                 <div className="ml-4">
                   <div className="font-semibold text-foreground">
                     {testimonial.name}
                   </div>
                   <p className="text-sm text-muted-foreground">
                     {testimonial.role} at {testimonial.company}
                   </p>
                 </div>
               </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
