import { SectionShell, SectionHeading, GlowCard, LightbulbIcon } from './Shared';

export default function QuickInferenceTips() {
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
