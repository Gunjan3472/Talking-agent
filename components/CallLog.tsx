
import React from 'react';
import { Message } from '../types';

interface CallLogProps {
  messages: Message[];
}

const CallLog: React.FC<CallLogProps> = ({ messages }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] scrollbar-hide">
      {messages.length === 0 ? (
        <div className="text-center text-slate-500 py-20 italic">
          Conversation will appear here...
        </div>
      ) : (
        messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}
            >
              <div className="text-[10px] opacity-60 mb-1">
                {msg.role === 'user' ? 'You' : 'VoxAI'}
              </div>
              {msg.text}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CallLog;
