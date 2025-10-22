import { SectionShell, SectionHeading, GlowCard, RocketIcon } from './Shared';

export default function TechHighlights() {
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
