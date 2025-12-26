import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../ui/button';
import { Sparkles } from 'lucide-react';

// Icon component matching Sections.tsx style
const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[100vh] flex items-center"
      aria-labelledby="hero-title"
    >
      {/* Background gradient overlay */}
      {/* <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-background via-background/70 to-background" /> */}

      <div className="container mx-auto px-6 md:px-8 max-w-8xl relative">
        <div className="mx-auto max-w-7xl text-center">
          {/* Badge - Christmas Image */}
          {/* <div className="mb-10 md:mb-12 w-full max-w-5xl mx-auto">
            <Link href="/christmas" aria-label="Go to Christmas page">
              <div className="relative w-full rounded-lg overflow-hidden shadow-2xl transition-transform hover:scale-[1.02]">
                <Image
                  src="https://cfsource.infinitetalk.net/infinitetalk/christmas/christmas.png"
                  alt="Christmas"
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{ width: '100%', height: 'auto' }}
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div> */}
          <div className="flex justify-center mb-10 md:mb-12">
            {/* <Link href="/infinitetalk" aria-label="Go to AI Video Generator"> */}
              <Button
                variant="outline"
                className="border-2 border-primary/30 bg-transparent hover:bg-primary/10 text-primary hover:text-primary px-6 py-3 text-sm font-semibold transition-all hover:scale-105 shadow-lg flex items-center justify-center gap-2 rounded-full"
              >
                <RocketIcon />
                AI Video Generator
              </Button>
            {/* </Link> */}
          </div>

          {/* Title */}
          <h1 id="hero-title" className="mb-8 md:mb-10">
            <span className="block text-5xl md:text-7xl lg:text-7xl font-black tracking-tight leading-[0.9] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              InfiniteTalk AI
            </span>
            <span> </span>
            <span className="mt-4 block text-2xl md:text-4xl font-semibold text-muted-foreground/90">
              Audio‑Driven Video Generation
            </span>
            <span> </span>
            <span className="mt-2 block text-xl md:text-3xl font-medium text-primary">
              Without Limits
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/80 max-w-7xl mx-auto leading-relaxed mb-10 md:mb-14 font-light">
            Create infinite‑length talking videos from any video or image. <span className="text-primary font-semibold">InfiniteTalk AI </span>
            delivers razor‑accurate lip sync, expressive full‑body motion, and rock‑solid identity preservation—powered by next‑gen sparse‑frame technology.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
            <Link href="/infinitetalk" aria-label="Try InfiniteTalk AI now">
              <Button className="group relative min-w-[220px] h-14 md:h-16 text-base md:text-xl font-bold bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 will-change-transform">
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="mr-3 transition-transform group-hover:translate-x-1">
                  <RocketIcon />
                </span>
                <span>Try InfiniteTalk AI</span>
              </Button>
            </Link>
            <Link href="/infinitetalk-multi" aria-label="Try InfiniteTalk Multi AI now">
              <Button variant="outline" className="group relative min-w-[220px] h-14 md:h-16 text-base md:text-xl font-bold border-2 border-primary/30 bg-transparent hover:bg-primary/10 text-primary hover:text-primary shadow-lg hover:shadow-primary/20 transition-all duration-300 will-change-transform">
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="mr-3 transition-transform group-hover:translate-x-1">
                  <RocketIcon />
                </span>
                <span>InfiniteTalk Multi AI</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#how-it-works"
        aria-label="Scroll to How it works"
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-8 h-12 border-2 border-primary/40 rounded-full flex justify-center items-start backdrop-blur">
          <div className="w-1.5 h-4 bg-gradient-to-b from-primary/60 to-primary/30 rounded-full mt-2 animate-pulse" />
        </div>
      </a>
    </section>
  );
}
