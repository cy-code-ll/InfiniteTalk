import { SectionShell, SectionHeading, GlowCard, PlayIcon, VideoIcon, ZapIcon, DownloadIcon } from './Shared';

export default function GettingStarted() {
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
