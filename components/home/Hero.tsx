'use client';

import Link from 'next/link';
import { Button } from '../ui/button';

export default function Hero() {
  return (
    <section className="pt-24 pb-16 bg-gradient-to-b from-background to-[#0a0a0a]">
      <div className="container mx-auto px-6 max-w-7xl">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
          MeiGen-InfiniteTalk — Audio-Driven Sparse-Frame Video Dubbing
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
          Infinite Talk AI lets you dub or animate any video with natural, audio-synchronized full-body motion while preserving identity, background, and camera paths. Built for long sequences, Infinite Talk AI keeps expressions, head turns, and posture aligned to speech—far beyond lip-only editing. Launch Infinite Talk AI now to create cinematic dubbing at 480p or 720p with streaming stability and precise control.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" aria-label="Try Infinite Talk AI">
            <Button className="min-w-[180px]">Try Infinite Talk AI</Button>
          </Link>
          
          <a
            href="https://arxiv.org/abs/2508.14033"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Technique Report"
          >
            <Button variant="ghost" className="min-w-[170px]">Technique Report</Button>
          </a>
          <a
            href="https://github.com/CoderKtera/Infinite-Talk-AI.git"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Code"
          >
            <Button variant="ghost" className="min-w-[100px]">Code</Button>
          </a>
        </div>
      </div>
    </section>
  );
}


