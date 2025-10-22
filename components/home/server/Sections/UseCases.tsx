import { SectionShell, SectionHeading, GlowCard, GlobeIcon } from './Shared';

export default function UseCases() { 
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
