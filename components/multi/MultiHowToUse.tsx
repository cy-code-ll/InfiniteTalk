export default function MultiHowToUse() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-gradient-to-b from-transparent to-slate-900/20">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-3">
              How to Use InfiniteTalk Multi
            </h2>
            <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Create multi-character conversations in four simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">1</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Upload an Image</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                One picture is enough for each character. Upload a high-quality portrait for best results.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">2</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Add Audio</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Input two separate voice tracks or songs. Each audio will be synced to the character.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">3</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Generate</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                InfiniteTalk Multi syncs lips, expressions, and body motion for both speakers automatically.
              </p>
            </div>
            
            <div className="group text-center p-8 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-slate-700/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <span className="text-primary font-bold text-2xl">4</span>
              </div>
              <h3 className="text-white font-semibold text-xl mb-3 group-hover:text-primary transition-colors duration-300">Export & Share</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Download your conversational video in minutes and share it with the world.
              </p>
            </div>
          </div>

          {/* Example Resources Table */}
          <div className="mt-20">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
              Example Resources
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse table-fixed">
                {/* Header Row */}
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="w-1/3 p-6 text-left text-white font-semibold text-lg bg-gradient-to-b from-slate-800/60 to-slate-900/60">
                      Two speakers' audio
                    </th>
                    <th className="w-1/3 p-6 text-left text-white font-semibold text-lg bg-gradient-to-b from-slate-800/60 to-slate-900/60 border-l border-slate-700/50">
                      Image with two people
                    </th>
                    <th className="w-1/3 p-6 text-left text-white font-semibold text-lg bg-gradient-to-b from-slate-800/60 to-slate-900/60 border-l border-slate-700/50">
                      Final outcome
                    </th>
                  </tr>
                </thead>
                {/* Content Row */}
                <tbody>
                  <tr>
                    {/* Left Cell - Two Audio Players */}
                    <td className="w-1/3 p-6 bg-gradient-to-b from-slate-800/60 to-slate-900/60 border-b border-slate-700/50">
                      <div className="flex flex-col justify-center h-full space-y-4">
                        <div>
                          <audio
                            src="https://cfsource.infinitetalk.net/infinitetalk/multy-videocase/input-audio.MP3"
                            controls
                            className="w-full"
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                        <div>
                          <audio
                            src="https://cfsource.infinitetalk.net/infinitetalk/multy-videocase/input-audio2.MP3"
                            controls
                            className="w-full"
                          >
                            Your browser does not support the audio element.
                          </audio>
                        </div>
                        <div className="mt-6 space-y-3 text-sm text-slate-400">
                          <p className="text-slate-300 font-medium">* Ensure two audio files same duration.</p>
                          <div>
                            <p className="text-slate-300 font-medium mb-2">* Select Play Order:</p>
                            <ul className="space-y-1.5 ml-4 list-disc list-inside">
                              <li><span className="text-slate-300">Left to Right:</span> Plays left audio, then right.</li>
                              <li><span className="text-slate-300">Right to Left:</span> Plays right audio, then left.</li>
                              <li><span className="text-slate-300">Meanwhile:</span> Plays both simultaneously.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Middle Cell - Image */}
                    <td className="w-1/3 p-6 align-top bg-gradient-to-b from-slate-800/60 to-slate-900/60 border-l border-b border-slate-700/50">
                      <a
                        href="https://cfsource.infinitetalk.net/infinitetalk/multy-videocase/input-image.jpeg"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group h-full"
                      >
                        <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden bg-slate-700/30 border border-slate-600/50 hover:border-primary/50 transition-all duration-300">
                          <img
                            src="https://cfsource.infinitetalk.net/infinitetalk/multy-videocase/input-image.jpeg"
                            alt="Input image with two people"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </a>
                    </td>
                    {/* Right Cell - Video */}
                    <td className="w-1/3 p-6 align-top bg-gradient-to-b from-slate-800/60 to-slate-900/60 border-l border-b border-slate-700/50">
                      <a
                        href="https://cfsource.infinitetalk.net/infinitetalk/multy-videocase/output.mp4"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group h-full"
                      >
                        <div className="relative h-full min-h-[400px] rounded-lg overflow-hidden bg-slate-700/30 border border-slate-600/50 hover:border-primary/50 transition-all duration-300">
                          <video
                            src="https://cfsource.infinitetalk.net/infinitetalk/multy-videocase/output.mp4"
                            className="w-full h-full object-cover"
                            muted
                            loop
                            controls
                            playsInline
                          />
                        </div>
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
