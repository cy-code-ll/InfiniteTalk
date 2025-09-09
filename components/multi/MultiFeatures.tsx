'use client';

export default function MultiFeatures() {
  const features = [
    {
      title: "Multi-Character Lip-Sync",
      description: "Realistic dialogue or duet videos with multiple voices.",
      icon: "🎭"
    },
    {
      title: "Audio-Driven Animation",
      description: "Perfect sync of lips, expressions, and gestures with speech.",
      icon: "🎵"
    },
    {
      title: "Two-Speaker Support",
      description: "Create conversations or singing duets with natural interaction.",
      icon: "👥"
    },
    {
      title: "Identity Preservation",
      description: "Characters stay consistent across frames and dialogue turns.",
      icon: "🔒"
    },
    {
      title: "Image-to-Video",
      description: "Generate videos from just a single portrait or illustration.",
      icon: "🖼️"
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Key Features of InfiniteTalk Multi
            </h2>
            <p className="text-slate-300 text-lg">
              Advanced multi-character AI technology for realistic conversations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="p-6 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
