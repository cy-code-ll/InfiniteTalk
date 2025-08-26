'use client';

export function WhatIsIt() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-[#0a0a0a]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="bg-card/60 border border-border rounded-2xl p-8 md:p-10 shadow-card">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">What is it?</h2>
          <div className="h-1 w-16 bg-primary rounded-full mb-6" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            Infinite Talk AI is a sparse-frame video dubbing and image-to-video system. Give it a source video and target audio, and Infinite Talk AI generates a new take with accurate lips, expressive faces, and coordinated body motion. Provide a single image instead of a full video and Infinite Talk AI will extend it into minute-long human animation, maintaining identity and scene context.
          </p>
        </div>
      </div>
    </section>
  );
}

export function WhySparseFrame() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="bg-card/60 border border-border rounded-2xl p-8 md:p-10 shadow-card">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">Why sparse-frame?</h2>
          <div className="h-1 w-16 bg-primary rounded-full mb-6" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            Traditional dubbing edits only the mouth, which often breaks immersion. Infinite Talk AI preserves keyframes across the sequence so identity, signature gestures, and camera movement remain intact. By softly conditioning on reference frames, Infinite Talk AI blends control with creativity—keeping the look you love while adapting motion to the audio.
          </p>
        </div>
      </div>
    </section>
  );
}

export function KeyFeatures() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">Key features</h2>
        <div className="h-1 w-16 bg-primary rounded-full mb-8" />
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-muted-foreground text-base">
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card hover:-translate-y-1 transition-transform"><strong className="text-foreground">Full-body audio alignment.</strong> Infinite Talk AI synchronizes lips, head motion, body posture, and micro-expressions to speech.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card hover:-translate-y-1 transition-transform"><strong className="text-foreground">Infinite-length generation.</strong> With a streaming generator and temporal context frames, Infinite Talk AI avoids hard cuts and maintains momentum across chunks.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card hover:-translate-y-1 transition-transform"><strong className="text-foreground">Image-to-video mode.</strong> Start from a single portrait or product shot; Infinite Talk AI animates it with audio for up to a minute (and beyond with camera pan/zoom tricks).</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card hover:-translate-y-1 transition-transform"><strong className="text-foreground">Identity & scene preservation.</strong> Infinite Talk AI retains background, lighting, and camera trajectory while you redub in any language or style.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card hover:-translate-y-1 transition-transform"><strong className="text-foreground">Stability at speed.</strong> Infinite Talk AI reduces hand/body distortion and jitter, outperforming common baselines in long clips.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card hover:-translate-y-1 transition-transform"><strong className="text-foreground">Resolution options.</strong> Infinite Talk AI supports 480p and 720p for fast, cost-aware production.</li>
        </ul>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="bg-card/60 border border-border rounded-2xl p-8 md:p-10 shadow-card">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">How it works (high level)</h2>
          <div className="h-1 w-16 bg-primary rounded-full mb-6" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            Infinite Talk AI uses a streaming generator that ingests audio and context frames, then writes video in chunks with seamless transitions. Keyframes act as soft anchors; Infinite Talk AI adapts control strength based on similarity between incoming context and your reference frames. A simple sampling strategy adjusts positioning so Infinite Talk AI balances motion freedom with identity fidelity, yielding smooth, coherent sequences.
          </p>
        </div>
      </div>
    </section>
  );
}

export function QuickInferenceTips() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">Quick inference tips</h2>
        <div className="h-1 w-16 bg-primary rounded-full mb-8" />
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground text-base">
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Lip accuracy:</strong> In Infinite Talk AI, Audio-CFG ~3–5 increases sync strength without over-driving visuals.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">FusionX LoRA:</strong> Faster and sharper, yet can cause color shifting over long runs; use judiciously in Infinite Talk AI.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Video-to-video (V2V):</strong> Infinite Talk AI mirrors original camera motion; SDEdit helps for short clips but may shift color.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Image-to-video (I2V):</strong> For &gt; 1 minute, translate or slowly zoom your still to help Infinite Talk AI maintain color consistency.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Quantized models:</strong> When memory is tight, use the quantized build of Infinite Talk AI to keep jobs alive.</li>
        </ul>
      </div>
    </section>
  );
}

export function UseCases() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">Use cases</h2>
        <div className="h-1 w-16 bg-primary rounded-full mb-8" />
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground text-base">
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Global dubbing/localization.</strong> Redub lectures, ads, explainers, and training at scale with Infinite Talk AI while keeping the on-screen persona consistent.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Creator workflows.</strong> Turn podcasts into talking-head videos, animate thumbnails, or add motion to stills using Infinite Talk AI.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Studio pipelines.</strong> Previz long dialogue scenes, iterate performances, and test alt reads in Infinite Talk AI before final shoots.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Product & avatar videos.</strong> Create spokesperson clips and virtual hosts that stay on-brand with Infinite Talk AI.</li>
        </ul>
      </div>
    </section>
  );
}

export function Comparisons() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="bg-card/60 border border-border rounded-2xl p-8 md:p-10 shadow-card">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">Comparisons</h2>
          <div className="h-1 w-16 bg-primary rounded-full mb-6" />
          <p className="text-muted-foreground text-lg leading-relaxed">
            Unlike mouth-only editors, Infinite Talk AI edits the whole frame, aligning body language to audio for believable performances. In evaluations on public datasets, Infinite Talk AI delivered strong realism and emotional coherence, minimizing artifacts that distract viewers. Results remain stable over long sequences, where baseline models often drift; Infinite Talk AI sustains identity and rhythm.
          </p>
        </div>
      </div>
    </section>
  );
}

export function TechHighlights() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">Tech highlights</h2>
        <div className="h-1 w-16 bg-primary rounded-full mb-8" />
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground text-base">
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Temporal context frames:</strong> Infinite Talk AI carries momentum signals forward to prevent flicker and chunk seams.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Soft reference control:</strong> Infinite Talk AI scales control by context-to-reference similarity, preserving identity without stiffness.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">Sampling strategy:</strong> Fine-grained keyframe placement helps Infinite Talk AI balance control strength and motion alignment.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><strong className="text-foreground">End-to-end consistency:</strong> From lips to limbs, Infinite Talk AI ties facial nuance and body kinetics to the input audio.</li>
        </ul>
      </div>
    </section>
  );
}

export function GettingStarted() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">Getting started (3 steps)</h2>
        <div className="h-1 w-16 bg-primary rounded-full mb-8" />
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 text-muted-foreground text-base">
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-primary text-primary-foreground font-semibold">1</span><strong className="text-foreground">Choose mode.</strong> V2V for dubbing existing footage or I2V for animating a still—both supported in Infinite Talk AI.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-primary text-primary-foreground font-semibold">2</span><strong className="text-foreground">Prepare inputs.</strong> Clean audio, a reference video or image, and optional keyframes. Set resolution and Audio-CFG in Infinite Talk AI.</li>
          <li className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-primary text-primary-foreground font-semibold">3</span><strong className="text-foreground">Generate & refine.</strong> Run, preview, and tweak prompts, keyframe cadence, and sampling in Infinite Talk AI to hit your look.</li>
        </ol>
      </div>
    </section>
  );
}

export function FAQs() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-poppins">FAQs</h2>
        <div className="h-1 w-16 bg-primary rounded-full mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground text-base">
          <div className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><p><strong className="text-foreground">How long can clips be?</strong> Infinite Talk AI supports effectively unlimited length thanks to streaming generation.</p></div>
          <div className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><p><strong className="text-foreground">Does it keep camera motion?</strong> Infinite Talk AI tracks source trajectories; exact paths may vary but remain coherent.</p></div>
          <div className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><p><strong className="text-foreground">How do I avoid color shift?</strong> Prefer balanced CFG and gradual camera moves; Infinite Talk AI offers quantized and baseline modes for stability.</p></div>
          <div className="bg-card/60 border border-border rounded-xl p-6 shadow-card"><p><strong className="text-foreground">What hardware?</strong> Infinite Talk AI runs efficiently at 480p/720p; quantized models reduce memory pressure.</p></div>
        </div>
      </div>
    </section>
  );
}

export function CallToAction() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#0a0a0a] to-background">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <div className="bg-card/60 border border-border rounded-2xl p-10 shadow-card">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-poppins">Call to action</h2>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Ship believable, localized, long-form performances without reshoots. Start dubbing today with Infinite Talk AI.
          </p>
        </div>
      </div>
    </section>
  );
}


