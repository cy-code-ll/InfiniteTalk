import { SectionShell, SectionHeading, GlowCard, VideoIcon } from './Shared';

// Static video data
const VIDEOS = Array.from({ length: 9 }).map((_, i) => {
  const n = i + 1;
  return {
    id: n,
    src: `https://cfsource.infinitetalk.net/infinitetalk/newcases/case${n}.mp4`,
    poster: `https://cfsource.infinitetalk.net/infinitetalk/multy-videocase/case${n}.webp`,
    title: `InfiniteTalk Video Case ${n}`,
  };
});

export default function VideoCases() {
  return (
    <SectionShell>
      <SectionHeading title="InfiniteTalk AI Video Cases" kicker="Examples" icon={<VideoIcon />} />
      <div className="columns-1 md:columns-2 lg:columns-3" style={{ columnGap: '1rem' }}>
        {VIDEOS.map((video) => (
          <div key={video.id} className="mb-4 break-inside-avoid">
            <GlowCard className="overflow-hidden" padding="p-1">
              <div className="relative w-full bg-black rounded-xl overflow-hidden">
                <video
                  src={video.src}
                  poster={video.poster}
                  className="w-full h-auto object-cover"
                  loop
                  controls
                  playsInline
                  preload="none"
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

