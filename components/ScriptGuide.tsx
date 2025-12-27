
import React from 'react';
import { Scenario } from '../types';

interface ScriptGuideProps {
  scenario: Scenario | null;
}

const ScriptGuide: React.FC<ScriptGuideProps> = ({ scenario }) => {
  const defaultScripts = [
    { label: "Greeting", text: "Hello, I have a few questions." },
    { label: "Basic Inquiry", text: "What are your standard business hours?" },
    { label: "Process Question", text: "How long does it usually take to get a response?" }
  ];

  const scenarioScripts: Record<string, typeof defaultScripts> = {
    'gov-service': [
      { label: "Permit Help", text: "How do I apply for a residential parking permit?" },
      { label: "Waste Management", text: "When is the next bulky item pickup in my zone?" },
      { label: "Taxes", text: "I need help understanding my property tax assessment." }
    ],
    'corp-support': [
      { label: "Billing", text: "I think I was double-charged for my subscription last month." },
      { label: "Tech Issue", text: "My API keys are returning a 403 error unexpectedly." },
      { label: "Upgrade", text: "What features are included in the Enterprise plan?" }
    ],
    'campaign-outreach': [
      { label: "Platform", text: "What is your party's stance on renewable energy?" },
      { label: "Voting Info", text: "Where is my nearest polling station for Tuesday?" },
      { label: "Volunteer", text: "I'd like to help with the campaign door-knocking." }
    ],
    'emergency-dispatch': [
      { label: "Minor Accident", text: "There is a minor fender bender at 5th and Main. No injuries." },
      { label: "Service Request", text: "A fire hydrant is leaking near my apartment." },
      { label: "Information", text: "Is the local shelter open during this storm?" }
    ]
  };

  const currentScripts = scenario ? scenarioScripts[scenario.id] : defaultScripts;

  return (
    <div className="mt-4 p-4 glass rounded-2xl border border-white/5">
      <h5 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <span>📖</span> Suggested Demo Scripts
      </h5>
      <div className="space-y-2">
        {currentScripts.map((s, i) => (
          <div key={i} className="group cursor-pointer">
            <div className="flex items-center justify-between text-xs text-slate-300 bg-white/5 p-2 rounded-lg border border-white/5 group-hover:bg-white/10 group-hover:border-blue-500/30 transition-all">
              <span>{s.text}</span>
              <span className="text-[10px] text-slate-500 uppercase">{s.label}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[10px] text-slate-500 italic text-center">
        Tip: Try interrupting the AI to see how it handles natural flow.
      </p>
    </div>
  );
};

export default ScriptGuide;
