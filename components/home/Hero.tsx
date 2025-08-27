'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';

// Icon component matching Sections.tsx style
const RocketIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden min-h-[100vh] flex items-center bg-gradient-to-b from-background via-background/70 to-background"
      aria-labelledby="hero-title"
    >
      {/* Background: soft grid + aurora glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        {/* Subtle grid (masked to center) */}
        <div
          className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(to_right,theme(colors.border/40)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.border/40)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_65%)]"
        />

        {/* Aurora beams */}
        <div className="absolute -top-24 -left-24 h-[38rem] w-[38rem] rounded-full blur-3xl opacity-60 bg-gradient-to-tr from-primary/25 via-primary/10 to-transparent" />
        <div className="absolute top-1/3 -right-24 h-[34rem] w-[34rem] rounded-full blur-3xl opacity-60 bg-gradient-to-bl from-primary/20 via-primary/10 to-transparent" />
        <div className="absolute bottom-[-10rem] left-1/2 -translate-x-1/2 h-[28rem] w-[28rem] rounded-full blur-3xl opacity-50 bg-gradient-to-t from-primary/15 via-primary/5 to-transparent" />
      </div>

      <div className="container mx-auto px-6 md:px-8 max-w-7xl relative">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mx-auto max-w-4xl text-center"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 md:gap-3 mb-10 md:mb-12 px-4 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary text-xs md:text-sm font-medium backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="tracking-wide">AI‑Powered Sparse‑Frame Dubbing</span>
          </div>

          {/* Title */}
          <h1 id="hero-title" className="mb-8 md:mb-10">
            <span className="block text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Infinite Talk AI
            </span>
            <span className="mt-4 block text-2xl md:text-4xl font-semibold text-muted-foreground/90">
              Audio‑Driven Video Generation
            </span>
            <span className="mt-2 block text-xl md:text-3xl font-medium text-primary">
              Without Limits
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-base md:text-xl lg:text-2xl text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed mb-10 md:mb-14 font-light">
            Create infinite‑length talking videos from any video or image. <span className="text-primary font-semibold">Infinite Talk AI</span>
            delivers razor‑accurate lip sync, expressive full‑body motion, and rock‑solid identity preservation—powered by next‑gen sparse‑frame technology.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-8 md:mb-10">
            <Link href="/" aria-label="Try Infinite Talk AI now">
              <Button className="group relative min-w-[220px] h-14 md:h-16 text-base md:text-xl font-bold bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all duration-300 will-change-transform">
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="mr-3 transition-transform group-hover:translate-x-1">
                  <RocketIcon />
                </span>
                <span>Try Infinite Talk AI</span>
              </Button>
            </Link>

    
          </div>


        </motion.div>
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
