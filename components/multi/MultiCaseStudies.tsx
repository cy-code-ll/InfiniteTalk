'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

export default function MultiCaseStudies() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const caseStudies = [
    {
      id: 'case1',
      title: 'Podcast Conversation',
      description: 'Two hosts discussing AI technology with natural dialogue flow',
      video: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case1.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case1.webp'
    },
    {
      id: 'case2', 
      title: 'Educational Duet',
      description: 'Teacher and student engaging in interactive learning session',
      video: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case2.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case2.webp'
    },
    {
      id: 'case3',
      title: 'Music Collaboration',
      description: 'Two singers performing a beautiful duet with perfect sync',
      video: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case3.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case3.webp'
    },
    {
      id: 'case4',
      title: 'Interview Style',
      description: 'Professional interviewer and guest in engaging conversation',
      video: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case4.mp4',
      poster: 'https://cfsource.infinitetalk.net/infinitetalk/multi/cases/case4.webp'
    }
  ];

  const handleVideoPlay = (videoId: string) => {
    // Pause all other videos
    Object.keys(videoRefs.current).forEach(id => {
      if (id !== videoId && videoRefs.current[id]) {
        videoRefs.current[id]?.pause();
      }
    });
    
    setPlayingVideo(videoId);
  };

  const handleVideoPause = (videoId: string) => {
    setPlayingVideo(null);
  };

  const handleVideoEnded = (videoId: string) => {
    setPlayingVideo(null);
  };

  const handleMouseEnter = (videoId: string) => {
    // Only auto-play on desktop (not mobile)
    if (window.innerWidth >= 768) {
      const video = videoRefs.current[videoId];
      if (video && playingVideo !== videoId) {
        video.play();
        handleVideoPlay(videoId);
      }
    }
  };

  const handleMouseLeave = (videoId: string) => {
    // Only pause on desktop (not mobile)
    if (window.innerWidth >= 768) {
      const video = videoRefs.current[videoId];
      if (video && playingVideo === videoId) {
        video.pause();
        handleVideoPause(videoId);
      }
    }
  };

  const handleVideoClick = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    if (playingVideo === videoId) {
      video.pause();
      handleVideoPause(videoId);
    } else {
      // Pause all other videos first
      Object.keys(videoRefs.current).forEach(id => {
        if (id !== videoId && videoRefs.current[id]) {
          videoRefs.current[id]?.pause();
        }
      });
      
      video.play();
      handleVideoPlay(videoId);
    }
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-slate-900/20 to-transparent">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              InfiniteTalk Multi Case Studies
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
              See how <span className="text-primary font-semibold">InfiniteTalk Multi</span> creates realistic multi-character conversations across different scenarios. Each video demonstrates our advanced lip-sync technology in action.
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {caseStudies.map((caseStudy, index) => (
              <div
                key={caseStudy.id}
                className="group relative bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
                onMouseEnter={() => handleMouseEnter(caseStudy.id)}
                onMouseLeave={() => handleMouseLeave(caseStudy.id)}
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-slate-800">
                  <video
                    ref={(el) => {
                      videoRefs.current[caseStudy.id] = el;
                    }}
                    src={caseStudy.video}
                    poster={caseStudy.poster}
                    className="w-full h-full object-cover cursor-pointer md:cursor-default"
                    onClick={(e) => {
                      // Only handle click on mobile
                      if (window.innerWidth < 768) {
                        e.preventDefault();
                        handleVideoClick(caseStudy.id);
                      }
                    }}
                    onPlay={() => handleVideoPlay(caseStudy.id)}
                    onPause={() => handleVideoPause(caseStudy.id)}
                    onEnded={() => handleVideoEnded(caseStudy.id)}
                    preload="metadata"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Play/Pause Overlay - Only show on mobile */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 md:hidden">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      {playingVideo === caseStudy.id ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </div>
                  </div>
                  
                  {/* Mobile-only click overlay */}
                  <div className="absolute inset-0 md:hidden" onClick={() => handleVideoClick(caseStudy.id)} />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-slate-300 text-lg mb-6">
              Ready to create your own multi-character videos?
            </p>
            <a
              href="#hero"
              className="inline-flex items-center px-8 py-4 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors duration-300 shadow-lg hover:shadow-xl"
            >
              Try InfiniteTalk Multi Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
