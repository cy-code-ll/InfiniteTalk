import React from 'react';

export function Wans2vCaseStudies() {
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
          {caseStudies.filter(cs => cs.isWide).map((caseStudy) => (
            <div
              key={caseStudy.id}
              className="relative aspect-[32/9] bg-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <video
                src={caseStudy.videoSrc}
                poster={caseStudy.poster}
                className="w-full h-full object-cover"
                controls
                preload="none"
                playsInline
                loop
              />
            </div>
          ))}

          {/* Standard Videos (132 and asd) - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {caseStudies.filter(cs => !cs.isWide).map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <video
                  src={caseStudy.videoSrc}
                  poster={caseStudy.poster}
                  className="w-full h-full object-cover"
                  controls
                  preload="none"
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
