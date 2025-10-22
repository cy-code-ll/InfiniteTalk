import { SectionShell, GlowCard, SectionHeading, ZapIcon, CheckIcon, CrossIcon } from './Shared';

export default function Comparisons() {
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
