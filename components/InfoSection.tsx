
import React from 'react';

const InfoSection: React.FC = () => {
  const capabilities = [
    {
      title: "Contextual NLU",
      desc: "Advanced Natural Language Understanding that tracks context across long conversations, not just single keywords.",
      icon: "🧠",
      color: "from-blue-500 to-cyan-400"
    },
    {
      title: "Dynamic Routing",
      desc: "Automatically detects user intent and shifts personality or fetches relevant data without human hand-off.",
      icon: "🔀",
      color: "from-purple-500 to-indigo-400"
    },
    {
      title: "Live Reasoning",
      desc: "Processes complex queries and creates human-like responses in under 200ms using Gemini's native audio capabilities.",
      icon: "⚡",
      color: "from-amber-500 to-orange-400"
    }
  ];

  const govLinks = [
    { name: "Reserve Bank of India (RBI)", url: "https://www.rbi.org.in/", icon: "🏦" },
    { name: "Digital India Portal", url: "https://www.digitalindia.gov.in/", icon: "🇮🇳" },
    { name: "Govt. Citizen Services", url: "https://www.india.gov.in/", icon: "🏛️" }
  ];

  return (
    <div className="w-full space-y-20 py-12">
      {/* Infographic Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">How VoxAI Works</h2>
          <p className="text-slate-400">The lifecycle of an intelligent AI voice interaction</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Lines (Desktop Only) */}
          <div className="hidden md:block absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-blue-500/50 -translate-y-1/2 z-0" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-4 p-6 glass rounded-3xl border border-white/5">
            <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center text-2xl border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              📞
            </div>
            <h3 className="font-bold text-lg text-blue-400">1. Stream Capture</h3>
            <p className="text-sm text-slate-400">Microphone audio is converted into high-fidelity PCM streams and sent to our neural engine.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4 p-6 glass rounded-3xl border border-white/5 scale-110 shadow-xl shadow-purple-500/10">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center text-2xl border border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              🧠
            </div>
            <h3 className="font-bold text-lg text-purple-400">2. Neural Processing</h3>
            <p className="text-sm text-slate-400">Gemini Live processes semantics, tone, and intent simultaneously to formulate a logical response.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4 p-6 glass rounded-3xl border border-white/5">
            <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center text-2xl border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              🔊
            </div>
            <h3 className="font-bold text-lg text-green-400">3. Native Response</h3>
            <p className="text-sm text-slate-400">The AI generates raw audio output directly, ensuring a natural, low-latency human-like voice.</p>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Core AI Capabilities</h2>
          <p className="text-slate-400">Enterprise-grade features for modern organizations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {capabilities.map((cap, i) => (
            <div key={i} className="p-6 glass rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cap.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {cap.icon}
              </div>
              <h4 className="text-xl font-bold text-white mb-2">{cap.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Sources Section */}
      <section className="p-8 glass rounded-[2.5rem] border border-blue-500/20 bg-blue-500/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <span className="text-blue-500">🛡️</span> Verified Information Sources
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              To ensure transparency and trust, VoxAI agents are programmed to reference and cross-verify information from official government portals. For the most accurate and up-to-date data, we recommend visiting these verified sources directly.
            </p>
            <div className="flex flex-wrap gap-4">
              {govLinks.map((link, idx) => (
                <a 
                  key={idx}
                  href={link.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 text-xs font-semibold text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
                >
                  <span>{link.icon}</span> {link.name}
                </a>
              ))}
            </div>
          </div>
          <div className="md:w-1/3 flex justify-center">
             <div className="w-full max-w-[200px] aspect-square relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
                <img 
                  src="https://www.rbi.org.in/Scripts/images/RBI_Logo.png" 
                  alt="RBI Logo" 
                  className="w-full h-full object-contain relative z-10 opacity-80 filter brightness-125 contrast-125"
                  onError={(e) => {
                    // Fallback if logo fails
                    (e.target as any).style.display = 'none';
                  }}
                />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InfoSection;
