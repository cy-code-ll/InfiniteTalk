'use client';

import { HelpCircle } from 'lucide-react';
import { Tooltip } from '../ui/tooltip';

export default function MultiHowToUse() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-transparent to-slate-900/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              How to Use InfiniteTalk Multi
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Create multi-character conversations in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Upload an Image</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                One picture is enough for each character. Upload a high-quality portrait for best results.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Add Audio</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Input two separate voice tracks or songs. Each audio will be synced to the character.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Generate</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                InfiniteTalk Multi syncs lips, expressions, and body motion for both speakers automatically.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">4</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Export & Share</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Download your conversational video in minutes and share it with the world.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
