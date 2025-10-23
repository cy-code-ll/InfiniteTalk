import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Wans2vCTA() {
  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl relative text-center">
        <div className="inline-flex rounded-[22px] p-[1px] bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.cyan.500/.6),theme(colors.fuchsia.500/.5),theme(colors.blue.500/.6),theme(colors.cyan.500/.6))] shadow-[0_20px_60px_rgba(0,0,0,0.35)] w-full max-w-2xl">
          <div className="rounded-[21px] bg-white/5 backdrop-blur border border-white/10 px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12 w-full overflow-hidden">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-foreground mb-4 sm:mb-6 font-poppins leading-tight">
             Bring your stories to life using Wan-S2V.
            </h2>
            
            <a href="#wans2v-hero">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-xl border border-primary/20 w-full max-w-xs mx-auto"
              >
                🚀 Start Creating with Wan-S2V
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </a>
            
            <p className="text-muted-foreground text-xs sm:text-sm mt-4 sm:mt-6">
              Join thousands of creators who already use Wan-S2V
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
