import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Wans2vCTA() {
  return (
    <section className="py-28 relative">
      <div className="container mx-auto px-6 max-w-4xl relative text-center">
        <div className="inline-flex rounded-[22px] p-[1px] bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.cyan.500/.6),theme(colors.fuchsia.500/.5),theme(colors.blue.500/.6),theme(colors.cyan.500/.6))] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="rounded-[21px] bg-white/5 backdrop-blur border border-white/10 px-10 py-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-poppins">
             Bring your stories to life using Wan-S2V.
            </h2>
            
            <a href="#wans2v-hero">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
              >
                👉 Start Creating with Wan-S2V Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
            
            <p className="text-muted-foreground text-sm mt-6">
              Join thousands of creators who already use Wan-S2V
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
