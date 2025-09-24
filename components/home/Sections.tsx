'use client';

import React, { useState, useRef, useEffect } from 'react'

// Icon components
const VideoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const CpuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlayButtonIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const RocketIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

// Small status icons for tables
const CheckIcon = () => (
  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const CrossIcon = () => (
  <svg className="w-4 h-4 text-rose-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MicrophoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

/**
 * UI refresh only — copy stays the same
 * New vibe: aurora gradients, neon borders, glass, 3D tilt, and accent micro‑interactions
 */

// -----------------------------
// Shared UI helpers (layout + visuals only)
// -----------------------------

function SectionShell({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`py-28 relative ${className}`}>
      <div className="container mx-auto px-6 max-w-7xl relative">{children}</div>
    </section>
  )
}

function SectionHeading({ title, kicker, icon }: { title: string; kicker?: string; icon?: React.ReactNode }) {
  return (
    <div className="mb-12">
      {kicker && (
        <span className="inline-block mb-3 text-xs tracking-widest uppercase text-primary/80 bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
          {kicker}
        </span>
      )}
      <div className="flex items-center gap-4">
        {icon && (
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight font-poppins">
            {title}
          </h2>
          <div className="mt-4 h-[3px] w-28 bg-gradient-to-r from-primary via-primary/50 to-transparent rounded-full" />
        </div>
      </div>
    </div>
  )}

function GlowCard({ children, className = '', padding = 'p-6', innerClassName = '' }: React.PropsWithChildren<{ className?: string; padding?: string; innerClassName?: string }>) {
  return (
    <div className={`group relative ${className}`}>
      {/* Transparent glass card */}
      <div className={`relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl ${padding} shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-shadow duration-200 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.22)] transition-transform group-hover:-translate-y-0.5 ${innerClassName}`}>
        {children}
      </div>
    </div>
  )
}

function MediaFrame() {
  return (
    <div className="relative h-full min-h-[280px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 rounded-3xl bg-[conic-gradient(at_70%_20%,theme(colors.cyan.500/.25),transparent_30%,theme(colors.fuchsia.500/.25),transparent_60%,theme(colors.blue.500/.25),transparent_90%)]" />
      <div className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_140%)] bg-[radial-gradient(100%_120%_at_0%_0%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(120%_120%_at_100%_0%,rgba(255,255,255,0.07),transparent_60%)]" />
      {/* scanlines */}
      <div className="absolute inset-0 opacity-[0.07] [background-size:8px_8px] [background-image:linear-gradient(transparent_7px,rgba(255,255,255,0.6)_8px)]" />
      {/* HUD footer */}
      <div className="absolute bottom-5 left-5 right-5 flex items-center gap-3">
        <div className="h-2 w-2 rounded-full bg-primary/90 shadow-[0_0_16px_theme(colors.primary.DEFAULT)]" />
        <div className="h-[1px] flex-1 bg-gradient-to-r from-primary/70 via-primary/20 to-transparent" />
        <span className="px-3 py-1 text-[10px] tracking-widest uppercase rounded-full bg-black/40 text-white/80 border border-white/10">preview</span>
      </div>
    </div>
  )
}

// -----------------------------
// Sections (copy unchanged)
// -----------------------------

export function WhatIsIt() {
  return (
    <SectionShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
        <GlowCard>
          <SectionHeading title="InfiniteTalk: What is it?" icon={<VideoIcon />} />
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
            InfiniteTalk AI is a sparse-frame video dubbing and image-to-video system. Give it a source video and target audio, and InfiniteTalk AI generates a new take with accurate lips, expressive faces, and coordinated body motion. Provide a single image instead of a full video and InfiniteTalk AI will extend it into minute-long human animation, maintaining identity and scene context.
          </p>
          {/* floating chips */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">V2V</span>
            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">I2V</span>
            <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">Streaming</span>
          </div>
        </GlowCard>
        <div className="hidden lg:block">
          <MediaFrame />
        </div>
      </div>
    </SectionShell>
  )
}

export function WhySparseFrame() {
  return (
    <SectionShell>
      <GlowCard>
        <SectionHeading title="InfiniteTalk: Why sparse-frame?" icon={<SparklesIcon />} />
        <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
          Traditional dubbing edits only the mouth, which often breaks immersion. InfiniteTalk AI preserves keyframes across the sequence so identity, signature gestures, and camera movement remain intact. By softly conditioning on reference frames, InfiniteTalk AI blends control with creativity—keeping the look you love while adapting motion to the audio.
        </p>
      </GlowCard>
    </SectionShell>
  )
}

export function KeyFeatures() {
  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk AI Key Features" kicker="Highlights" icon={<StarIcon />} />
      <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mb-8">
        InfiniteTalk AI is designed to push the boundaries of AI-driven video dubbing. With advanced synchronization and flexible generation options, it enables creators, businesses, and developers to produce videos that feel authentic, scalable, and professional.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 text-muted-foreground text-base items-stretch">
        <div className="h-full ">
          <GlowCard className="h-full flex flex-col" innerClassName="group-hover:border-primary/30">
            <div className="flex items-start gap-4 flex-1 min-h-[120px]">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <VideoIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground block mb-2 font-semibold">Sparse-Frame Dubbing Technology</h3>
                <p>Unlike traditional lip-sync tools, InfiniteTalk AI drives not only lip movements but also subtle head tilts, posture shifts, and facial expressions for a human-like experience.</p>
              </div>
            </div>
          </GlowCard>
        </div>
        <div className="h-full">
          <GlowCard className="h-full flex flex-col " innerClassName="group-hover:border-primary/30">
            <div className="flex items-start gap-4 flex-1 min-h-[120px]">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <ZapIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground block mb-2 font-semibold">Unlimited Duration Video Generation</h3>
                <p>Remove short‑clip limits. Create lectures, podcasts, and full presentations without interruption.</p>
              </div>
            </div>
          </GlowCard>
        </div>
        <div className="h-full">
          <GlowCard className="h-full flex flex-col" innerClassName="group-hover:border-primary/30">
            <div className="flex items-start gap-4 flex-1 min-h-[120px]">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CpuIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground block mb-2 font-semibold">Next-Level Stability</h3>
                <p>Minimizes distortion in hands, arms, and body positions, delivering smooth, stable output across extended sequences.</p>
              </div>
            </div>
          </GlowCard>
        </div>
        <div className="h-full">
          <GlowCard className="h-full flex flex-col" innerClassName="group-hover:border-primary/30">
            <div className="flex items-start gap-4 flex-1 min-h-[120px]">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <StarIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground block mb-2 font-semibold">Precision Lip Alignment</h3>
                <p>Professional‑grade audio‑to‑visual alignment ensures lip movements match speech precisely.</p>
              </div>
            </div>
          </GlowCard>
        </div>
        <div className="h-full">
          <GlowCard className="h-full flex flex-col" innerClassName="group-hover:border-primary/30">
            <div className="flex items-start gap-4 flex-1 min-h-[120px]">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <MicrophoneIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground block mb-2 font-semibold">Multi-Speaker Capabilities</h3>
                <p>With InfiniteTalk AI Multi, support multiple characters in one video—each with independent audio tracks and reference controls.</p>
              </div>
            </div>
          </GlowCard>
        </div>
        <div className="h-full">
          <GlowCard className="h-full flex flex-col" innerClassName="group-hover:border-primary/30">
            <div className="flex items-start gap-4 flex-1 min-h-[120px]">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <DownloadIcon />
              </div>
              <div className="flex-1">
                <h3 className="text-foreground block mb-2 font-semibold">Flexible Input Options</h3>
                <p>Adapt to your workflow with both image‑to‑video generation and video‑to‑video enhancement.</p>
              </div>
            </div>
          </GlowCard>
        </div>
      </div>
    </SectionShell>
  )
}

export function HowItWorks() {
  return (
    <SectionShell>
      <GlowCard>
        <SectionHeading title="InfiniteTalk AI: How it works (high level)" kicker="Pipeline" icon={<CpuIcon />} />
        <div className="relative pl-6">
          <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-gradient-to-b from-primary to-primary/30 rounded-full" />
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
            InfiniteTalk AI uses a streaming generator that ingests audio and context frames, then writes video in chunks with seamless transitions. Keyframes act as soft anchors; InfiniteTalk AI adapts control strength based on similarity between incoming context and your reference frames. A simple sampling strategy adjusts positioning so InfiniteTalk AI balances motion freedom with identity fidelity, yielding smooth, coherent sequences.
          </p>
        </div>
      </GlowCard>
    </SectionShell>
  )
}

export function QuickInferenceTips() {
  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk AI Technical Capabilities" kicker="Technical" icon={<LightbulbIcon />} />
      <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl mb-8">
        The strength of InfiniteTalk AI lies in its technical foundation, combining speed, accuracy, and scalability for creators at every level.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-7 text-muted-foreground text-base items-stretch">
        {[
          [
            'Advanced Audio Synchronization',
            'Deep audio analysis synchronizes lip shapes, head turns, and expressions with voice input so avatars behave naturally instead of mechanically.',
          ],
          [
            'Memory-Aware Processing',
            'Overlapping segments keep long videos consistent, preventing visual breaks or sudden motion changes for smooth continuity.',
          ],
          [
            'Resolution Options',
            'Choose from lightweight 480p for faster processing or sharper 720p/1080p when higher quality is needed.',
          ],
          [
            'Optimized for All Hardware',
            'Acceleration, parameter grouping, and quantization let InfiniteTalk AI run efficiently on limited‑VRAM systems without compromising quality.',
          ],
        ].map(([strong, rest]) => (
          <div key={String(strong)} className="h-full">
            <GlowCard className="h-full flex flex-col" innerClassName="group-hover:border-primary/30">
              <h3 className="text-foreground block mb-2 font-semibold">{strong}</h3>
              <p className="flex-1 min-h-[100px]">{rest}</p>
            </GlowCard>
          </div>
        ))}
      </div>
    </SectionShell>
  )
}

export function UseCases() { 
  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk AI Application Scenarios" kicker="Where it shines" icon={<GlobeIcon />} />
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-7 text-muted-foreground text-base">
        {[
          [
            'Content Creation',
            'Produce long-form tutorials, educational materials, and storytelling videos where avatars stay consistent and lifelike.',
          ],
          [
            'Entertainment & Media',
            'Generate animated hosts, characters, and podcast visuals that scale with your creativity.',
          ],
          [
            'Business & Corporate Communication',
            'Create polished training modules, investor updates, and product demos with natural, reliable avatars.',
          ],
          [
            'Accessibility',
            'Support communities with avatars that provide spoken and visual communication cues for clearer information delivery.',
          ],
          [
            'Research & Innovation',
            'Explore digital humans, virtual reality, and interactive AI for academic and developer research.',
          ],
          [
            'Multilingual Production',
            'Keep the same avatar while delivering content in multiple languages, preserving brand identity across markets.',
          ],
        ].map(([strong, rest]) => (
          <li key={String(strong)}>
            <GlowCard>
              <h3 className="text-foreground block mb-2 font-semibold">{strong}</h3>
              <p>{rest}</p>
            </GlowCard>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export function Comparisons() {
  return (
    <SectionShell>
      <GlowCard>
        <SectionHeading title="InfiniteTalk AI Advantages" kicker="Why choose" icon={<ZapIcon />} />
        <div className="overflow-x-auto">
          <table className="w-full text-sm md:text-base text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 pr-4 text-foreground">Feature</th>
                <th className="py-3 px-4 text-foreground">Traditional Digital Humans</th>
                <th className="py-3 pl-4 text-foreground">InfiniteTalk AI</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">Video Length</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Limited to short clips (5s–1 min)</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Unlimited video length generation</span></td>
              </tr>
              <tr className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">Synchronization</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Lip-sync only; lacks head and body movement</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Full sync of lips, head, body & expressions</span></td>
              </tr>
              <tr className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">Lip Accuracy</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Often misaligned in professional use</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Superior lip precision</span></td>
              </tr>
              <tr className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">Multi-Person Support</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Usually limited to one avatar per video</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Multiple characters with independent audio</span></td>
              </tr>
              <tr className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">Input Options</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Rigid template-to-video workflow, complex to operate</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Flexible image-to-video & video-to-video support</span></td>
              </tr>
              <tr className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">Output Resolution</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Typically restricted to lower resolutions</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Supports 720P and 1080P HD output</span></td>
              </tr>
              <tr className="border-b border-white/5 align-top">
                <td className="py-3 pr-4">Stability</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Distortions and artifacts in long videos</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Smooth, natural results even for extended content</span></td>
              </tr>
              <tr className="align-top">
                <td className="py-3 pr-4">Scalability</td>
                <td className="py-3 px-4"><span className="inline-flex items-center gap-2"><CrossIcon /> Mostly used for short marketing clips</span></td>
                <td className="py-3 pl-4"><span className="inline-flex items-center gap-2"><CheckIcon /> Broad applications: education, business, entertainment, research</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-muted-foreground">Choose InfiniteTalk and go beyond traditional digital human limits.</p>
      </GlowCard>
    </SectionShell>
  )
}

export function TechHighlights() {
  const items: [string, string][] = [
    [
      'Temporal context frames:',
      'InfiniteTalk AI carries momentum signals forward to prevent flicker and chunk seams.',
    ],
    [
      'Soft reference control:',
      'InfiniteTalk AI scales control by context-to-reference similarity, preserving identity without stiffness.',
    ],
    [
      'Sampling strategy:',
      'Fine-grained keyframe placement helps InfiniteTalk AI balance control strength and motion alignment.',
    ],
    [
      'End-to-end consistency:',
      'From lips to limbs, InfiniteTalk AI ties facial nuance and body kinetics to the input audio.',
    ],
  ]
  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk Tech Highlights" kicker="Under the hood" icon={<RocketIcon />} />
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-7 text-muted-foreground text-base">
        {items.map(([strong, rest]) => (
          <li key={strong}>
            <GlowCard>
              <h3 className="text-foreground block mb-2 font-semibold">{strong}</h3>
              <p>{rest}</p>
            </GlowCard>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export function GettingStarted() {
  const steps: [number, string, string, React.ReactNode][] = [
    [1, 'Upload Source & Audio', 'Choose a video or image and upload your speech, podcast, or dialogue to dub with InfiniteTalk AI.', <VideoIcon />],
    [2, 'Generate with InfiniteTalk AI', 'Instantly produce a lip‑synced, full‑body animated video using InfiniteTalk AI.', <ZapIcon />],
    [3, 'Export & Share', 'Download in 480p/720p and share anywhere. Created with InfiniteTalk AI.', <DownloadIcon />],
  ]
  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk: How to use" kicker="Onboarding" icon={<PlayIcon />} />
      <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 text-muted-foreground text-base">
        {steps.map(([n, strong, rest, icon]) => (
          <li key={n} className="flex">
            <div className="relative w-full">
              <div className="absolute -top-4 left-6 inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-semibold shadow-[0_10px_20px_theme(colors.primary.DEFAULT/0.4)] z-10">
                {n}
              </div>
              <GlowCard className="h-full">
                <div className="flex flex-col items-center text-center gap-4 pt-8">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground text-lg font-bold mb-3">{strong}</h3>
                    <p className="text-sm leading-relaxed">{rest}</p>
                  </div>
                </div>
              </GlowCard>
            </div>
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}

export function FAQs() {
  const faqs: [string, string][] = [
    [
      'What is InfiniteTalk AI?',
      'InfiniteTalk AI is an advanced model for audio‑driven video generation, enabling lip‑synced and body‑synced animations that go beyond traditional dubbing. InfiniteTalk AI creates coherent motion and consistent identity from your inputs.',
    ],
    [
      'How does InfiniteTalk AI differ from traditional dubbing?',
      'Conventional dubbing edits only the mouth. InfiniteTalk AI edits the whole frame, synchronizing lip movement, facial expressions, head motion, and gestures for natural‑looking results.',
    ],
    [
      'What inputs does InfiniteTalk AI support?',
      'Provide either a video + audio (video‑to‑video) or a single image + audio (image‑to‑video). InfiniteTalk AI supports both workflows.',
    ],
    [
      'How long can videos generated with InfiniteTalk AI be?',
      'InfiniteTalk AI supports unlimited‑length generation, suitable for lectures, podcasts, storytelling, and other long‑form content.',
    ],
    [
      'What resolutions are available in InfiniteTalk AI?',
      'InfiniteTalk AI currently exports 480p and 720p, with higher resolutions planned.',
    ],
    [
      'Is InfiniteTalk AI free to use?',
      'InfiniteTalk AI offers free research access and premium SaaS options. Free users can try short clips; paid tiers unlock longer, higher‑quality exports.',
    ],
  ]
  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk FAQs" kicker="Answers" icon={<QuestionIcon />} />
      <ul className="text-muted-foreground text-base space-y-6">
        {faqs.map(([q, a]) => (
          <li key={q}>
            <GlowCard>
              <h3 className="text-foreground mb-1 font-semibold">{q}</h3>
              <p>{a}</p>
            </GlowCard>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

export function VideoCases() {
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const videos = Array.from({ length: 9 }).map((_, i) => {
    const n = i + 1
    return {
      id: n,
      src: `https://cfsource.infinitetalk.net/infinitetalk/newcases/case${n}.mp4`,
      poster: `https://cfsource.wananimate.net/zipimg/zip_case${n}.webp`,
      title: `InfiniteTalk Video Case ${n}`,
    }
  })

  const handleVideoClick = (index: number) => {
    const clickedVideo = videoRefs.current[index];
    if (!clickedVideo) return;

    // Pause all other videos
    videoRefs.current.forEach((video, i) => {
      if (video && i !== index) {
        video.pause();
      }
    });

    if (currentPlaying === index) {
      // Pause current video
      clickedVideo.pause();
      setCurrentPlaying(null);
    } else {
      // Play clicked video
      clickedVideo.play();
      setCurrentPlaying(index);
    }
  };

  useEffect(() => {
    // Set up video event listeners
    videoRefs.current.forEach((video, index) => {
      if (video) {
        const handleEnded = () => {
          if (currentPlaying === index) {
            setCurrentPlaying(null);
          }
        };
        video.addEventListener('ended', handleEnded);
        return () => video.removeEventListener('ended', handleEnded);
      }
    });
  }, [currentPlaying]);

  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk AI Video Cases" kicker="Examples" icon={<VideoIcon />} />
      <div className="columns-1 md:columns-2 lg:columns-3" style={{ columnGap: '1rem' }}>
        {videos.map((video, index) => (
          <div key={video.id} className="mb-4 break-inside-avoid">
            <GlowCard className="overflow-hidden" padding="p-1">
              <div className="relative w-full bg-black rounded-xl overflow-hidden">
                <video
                  ref={(el) => { videoRefs.current[index] = el; }}
                  src={video.src}
                  poster={video.poster}
                  className="w-full h-auto object-cover cursor-pointer"
                  loop
                  controls
                  playsInline
                  preload="none"
                  onClick={() => handleVideoClick(index)}
                  title={video.title}
                  aria-label={video.title}
                />
              </div>
            </GlowCard>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CallToAction() {
  return (
    <section className="py-32">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center">
          <div className="inline-flex rounded-[22px] p-[1px] bg-[conic-gradient(from_180deg_at_50%_50%,theme(colors.cyan.500/.6),theme(colors.fuchsia.500/.5),theme(colors.blue.500/.6),theme(colors.cyan.500/.6))] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="rounded-[21px] bg-white/5 backdrop-blur border border-white/10 px-10 py-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-poppins">Call to action</h2>
              <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
                Ship believable, localized, long-form performances without reshoots. Start dubbing today with InfiniteTalk AI.
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <a className="group relative px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-black/20 hover:shadow-xl transition-shadow">
                  <span className="absolute inset-0 rounded-xl [mask-image:linear-gradient(white,transparent)] opacity-0 group-hover:opacity-100 transition-opacity bg-[linear-gradient(90deg,rgba(255,255,255,0.35),transparent_40%,transparent_60%,rgba(255,255,255,0.35))] [background-size:200%_100%] animate-[shimmer_1.2s_linear_infinite]" />
                  Start Dubbing
                </a>
                <a className="px-5 py-3 rounded-xl bg-transparent border border-border/80 text-foreground hover:border-primary/40 transition-colors">
                  See How It Works
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* keyframes for shimmer */}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </section>
  )
}
