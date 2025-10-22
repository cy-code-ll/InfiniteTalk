import { SectionShell, SectionHeading, GlowCard, StarIcon, VideoIcon, ZapIcon, CpuIcon, MicrophoneIcon, DownloadIcon } from './Shared';

export default function KeyFeatures() {
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
