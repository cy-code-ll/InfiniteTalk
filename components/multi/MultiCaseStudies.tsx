export default function MultiCaseStudies() {
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
            {caseStudies.map((caseStudy) => (
              <div
                key={caseStudy.id}
                className="group relative bg-gradient-to-b from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-slate-800">
                  <video
                    src={caseStudy.video}
                    poster={caseStudy.poster}
                    className="w-full h-full object-cover"
                    controls
                    preload="none"
                    playsInline
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-white font-semibold text-xl mb-2">
                    {caseStudy.title}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {caseStudy.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <p className="text-slate-300 text-lg mb-6">
              Ready to create your own multi-character conversations?
            </p>
            <a
              href="#multi-generator"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
            >
              Start Creating Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
