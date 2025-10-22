import { SectionShell, SectionHeading, GlowCard, QuestionIcon } from './Shared';

export default function FAQs() {
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
