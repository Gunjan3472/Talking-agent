
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { SCENARIOS } from './constants';
import { CallStatus, Scenario, Message } from './types';
import { encode, decode, decodeAudioData } from './services/audioUtils';
import Waveform from './components/Waveform';
import CallLog from './components/CallLog';
import InfoSection from './components/InfoSection';
import ScriptGuide from './components/ScriptGuide';

const App: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [status, setStatus] = useState<CallStatus>(CallStatus.IDLE);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio context and session refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const currentTranscriptRef = useRef<{ user: string; model: string }>({ user: '', model: '' });

  const stopCall = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
    }
    activeSourcesRef.current.forEach(source => source.stop());
    activeSourcesRef.current.clear();
    
    setStatus(CallStatus.DISCONNECTED);
    setTimeout(() => setStatus(CallStatus.IDLE), 3000);
  }, []);

  const startCall = async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setStatus(CallStatus.CONNECTING);
    setMessages([]);
    currentTranscriptRef.current = { user: '', model: '' };

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.debug('VoxAI: Connection established');
            setStatus(CallStatus.ACTIVE);
            
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              currentTranscriptRef.current.user += message.serverContent.inputTranscription.text;
            }
            if (message.serverContent?.outputTranscription) {
              currentTranscriptRef.current.model += message.serverContent.outputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              const u = currentTranscriptRef.current.user.trim();
              const m = currentTranscriptRef.current.model.trim();
              if (u) setMessages(prev => [...prev, { role: 'user', text: u, timestamp: Date.now() }]);
              if (m) setMessages(prev => [...prev, { role: 'model', text: m, timestamp: Date.now() }]);
              currentTranscriptRef.current = { user: '', model: '' };
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                activeSourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              activeSourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => s.stop());
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('VoxAI Session Error:', e);
            stopCall();
          },
          onclose: () => {
            console.debug('VoxAI: Session closed');
            stopCall();
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: scenario.systemInstruction,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;

    } catch (error) {
      console.error('Failed to start call:', error);
      setStatus(CallStatus.IDLE);
      alert("Could not access microphone or connect to AI service.");
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center max-w-6xl mx-auto">
      {/* Header */}
      <header className="w-full mb-8 text-center">
        <div className="inline-block px-4 py-1 mb-2 text-xs font-bold tracking-widest text-blue-400 uppercase glass rounded-full">
          Hackathon 2025 | AI Innovation
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          VoxAI Agent
        </h1>
        <p className="mt-2 text-slate-400 max-w-lg mx-auto font-medium">
          The future of organizational voice interaction. Multi-sector, real-time, and human-centric.
        </p>
      </header>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
        {/* Left Panel: Scenario Selection & Script Guide */}
        <div className="lg:col-span-4 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="p-2 bg-slate-800 rounded-lg">📋</span>
              Select Sector
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  disabled={status !== CallStatus.IDLE}
                  onClick={() => startCall(scenario)}
                  className={`text-left p-4 glass rounded-2xl transition-all border-2 ${
                    selectedScenario?.id === scenario.id 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-transparent hover:border-slate-700 hover:bg-white/5'
                  } ${status !== CallStatus.IDLE && 'opacity-50 grayscale cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{scenario.icon}</span>
                    <span className="font-bold text-slate-100">{scenario.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                    {scenario.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
                      scenario.type === 'inbound' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {scenario.type} CALL
                    </span>
                    <span className="text-xs text-blue-400 font-medium">Configure →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <ScriptGuide scenario={selectedScenario} />
        </div>

        {/* Right Panel: Active Call UI */}
        <div className="lg:col-span-8">
          <div className="glass h-[650px] rounded-[2.5rem] overflow-hidden flex flex-col relative border border-slate-700/50 shadow-2xl">
            {/* Call Header */}
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between bg-white/5 z-20">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 ${
                  status === CallStatus.ACTIVE ? 'bg-blue-600 pulse-animation scale-110 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'bg-slate-800'
                }`}>
                  {selectedScenario?.icon || '📞'}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{selectedScenario?.name || 'VoxAI Switchboard'}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      status === CallStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 
                      status === CallStatus.CONNECTING ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'
                    }`} />
                    <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">
                      {status === CallStatus.ACTIVE ? 'Live Stream Active' : 
                       status === CallStatus.CONNECTING ? 'Negotiating TLS Handshake...' : 
                       status === CallStatus.DISCONNECTED ? 'Session Ended' : 'Awaiting Connection'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:scale-105'}`}
                >
                  {isMuted ? '🔇' : '🎤'}
                </button>
              </div>
            </div>

            {/* Transcription Log */}
            <div className="flex-1 overflow-hidden flex flex-col z-10">
              <CallLog messages={messages} />
            </div>

            {/* Footer / Controls */}
            <div className="p-10 border-t border-slate-700/50 flex flex-col items-center gap-8 bg-black/40 z-20">
              <div className="w-full flex justify-center py-2">
                <Waveform isActive={status === CallStatus.ACTIVE && !isMuted} color={selectedScenario?.color === 'red' ? '#ef4444' : '#60a5fa'} />
              </div>
              
              <div className="flex items-center gap-16">
                <div className="flex flex-col items-center gap-2">
                   <button 
                    disabled={status === CallStatus.IDLE}
                    onClick={stopCall}
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all active:scale-90 shadow-xl ${
                      status !== CallStatus.IDLE ? 'bg-red-600 hover:bg-red-500 cursor-pointer' : 'bg-slate-800 opacity-20 cursor-not-allowed'
                    }`}
                  >
                    📵
                  </button>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Terminate</span>
                </div>

                {status === CallStatus.IDLE && (
                   <div className="flex flex-col items-center gap-2">
                   <button 
                    onClick={() => selectedScenario && startCall(selectedScenario)}
                    disabled={!selectedScenario}
                    className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all active:scale-95 shadow-[0_0_50px_rgba(34,197,94,0.3)] ${
                      selectedScenario ? 'bg-green-600 hover:bg-green-500 cursor-pointer scale-110' : 'bg-slate-800 opacity-20 cursor-not-allowed'
                    }`}
                  >
                    📞
                  </button>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse mt-2">Initialize Link</span>
                </div>
                )}
              </div>
            </div>

            {/* Overlay for inactive states */}
            {status === CallStatus.IDLE && (
              <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-12 z-30">
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 bg-blue-600/10 rounded-3xl mx-auto flex items-center justify-center text-6xl mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                    🎙️
                  </div>
                  <h4 className="text-3xl font-bold text-white mb-4">Start Interaction</h4>
                  <p className="text-slate-400 mb-10 leading-relaxed">
                    Pick an organization profile on the left to begin your real-time voice call simulation.
                  </p>
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-600">Quick Start Options</span>
                    <div className="flex gap-3 justify-center">
                      <div className="px-4 py-2 bg-blue-500/10 rounded-xl text-xs font-bold border border-blue-500/20 text-blue-400">GovPortal</div>
                      <div className="px-4 py-2 bg-purple-500/10 rounded-xl text-xs font-bold border border-purple-500/20 text-purple-400">TechSupport</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Educational Sections */}
      <InfoSection />

      {/* Footer Branding */}
      <footer className="mt-20 pb-10 w-full text-center border-t border-slate-800 pt-10">
        <p className="text-slate-500 text-sm">
          Built with 💙 for the Hackathon 2025 by Team VoxAI
        </p>
      </footer>
    </div>
  );
};

export default App;
