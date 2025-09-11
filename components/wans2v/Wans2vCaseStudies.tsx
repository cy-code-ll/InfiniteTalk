'use client';

import React, { useRef, useState } from 'react';

export function Wans2vCaseStudies() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const caseStudies = [
    {
      id: 1,
      videoSrc: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/a1.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/a1.webp',
      isWide: true,
    },
    {
      id: 2,
      videoSrc: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/a2.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/a2.webp',
      isWide: true,
    },
    {
      id: 3,
      videoSrc: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/132.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/132.webp',
      isWide: false,
    },
    {
      id: 4,
      videoSrc: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/asd.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/video/s2vdemo/asd.webp',
      isWide: false,
    },
  ];

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
    const video = videoRefs.current[index];
    if (video) {
      video.play();
    }
  };

  const handleMouseLeave = (index: number) => {
    setHoveredIndex(null);
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      video.currentTime = 0; // Reset to beginning
    }
  };

  const setVideoRef = (el: HTMLVideoElement | null, index: number) => {
    videoRefs.current[index] = el;
  };

  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 font-poppins">
            🎬 Case Studies and Showcases
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Explore how creators use Wan-S2V to elevate content across industries
          </p>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 gap-8 lg:gap-12">
          {/* Wide Videos (a1 and a2) - Full Width */}
          {caseStudies.filter(cs => cs.isWide).map((caseStudy, index) => (
            <div
              key={caseStudy.id}
              className="relative aspect-[32/9] bg-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={() => handleMouseLeave(index)}
            >
              <video
                ref={(el) => setVideoRef(el, index)}
                src={caseStudy.videoSrc}
                poster={caseStudy.poster}
                className="w-full h-full object-cover"
                
                preload="metadata"
                playsInline
                loop
              />
            </div>
          ))}

          {/* Standard Videos (132 and asd) - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {caseStudies.filter(cs => !cs.isWide).map((caseStudy, index) => (
              <div
                key={caseStudy.id}
                className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                onMouseEnter={() => handleMouseEnter(index + 2)}
                onMouseLeave={() => handleMouseLeave(index + 2)}
              >
                <video
                  ref={(el) => setVideoRef(el, index + 2)}
                  src={caseStudy.videoSrc}
                  poster={caseStudy.poster}
                  className="w-full h-full object-cover"
                  
                  preload="metadata"
                  playsInline
                  loop
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
