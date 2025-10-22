import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-slate-900/30 to-slate-950/50">
      <div className="max-w-5xl mx-auto text-center">
        <div className="bg-gradient-to-r from-slate-800/60 to-slate-900/60 rounded-2xl border border-slate-700/50 backdrop-blur-sm p-12 md:p-16">
          <h2 className="text-5xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Videos?
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Start creating infinite-length talking videos with InfiniteTalk AI. 
            Generate professional lip-synced content in minutes, not hours.
          </p>
          <Link href="/infinitetalk">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4 text-lg font-semibold"
            >
              Start Creating Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <p className="text-sm text-slate-400 mt-4">
            No credit card required • Start with free credits
          </p>
        </div>
      </div>
    </section>
  );
}
