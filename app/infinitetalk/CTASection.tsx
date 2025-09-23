'use client';

export default function CTASection() {
  const handleScrollToGenerator = () => {
    const generatorElement = document.getElementById('infinite-talk-generator');
    if (generatorElement) {
      generatorElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="mb-16">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl border border-primary/20 backdrop-blur-xl p-8 md:p-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-primary text-3xl">🚀</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your Talking Video?
          </h3>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Experience the power of Infinite Talk AI. Upload your image and audio to create professional, 
            realistic talking avatar videos in minutes.
          </p>
          <button
            onClick={handleScrollToGenerator}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
          >
            <span>Start Creating Now</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-400">
      
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>Free trial available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span>Professional quality</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
