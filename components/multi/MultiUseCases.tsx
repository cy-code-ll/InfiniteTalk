'use client';

export default function MultiUseCases() {
  const useCases = [
    {
      title: "Podcasts & Interviews",
      description: "Turn audio into dynamic video conversations.",
      icon: "🎙️"
    },
    {
      title: "Education & Training",
      description: "Create realistic teacher-student or role-play dialogues.",
      icon: "🎓"
    },
    {
      title: "Content Creators",
      description: "Add talking duets or interviews to social content.",
      icon: "📱"
    },
    {
      title: "Entertainment",
      description: "Generate fun lip-sync skits, comedy dialogues, or music covers.",
      icon: "🎬"
    }
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Use Cases
            </h2>
            <p className="text-slate-300 text-lg">
              Perfect for various creative and professional applications
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-8 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm">
                <div className="text-5xl mb-4">{useCase.icon}</div>
                <h3 className="text-white font-semibold text-xl mb-3">
                  {useCase.title}
                </h3>
                <p className="text-slate-400">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
