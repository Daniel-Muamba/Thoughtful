"use client";

import React, { useState } from 'react';

type LensType = 'None' | 'Skeptic' | 'Teacher' | 'Auditor';

interface HighlightDef {
  textToHighlight: string;
  insight: string;
  challenge: string;
}

const LENSES: Record<string, HighlightDef[]> = {
  Skeptic: [
    {
      textToHighlight: 'always',
      insight: "This uses 'absolute' language like 'always' or 'never'.",
      challenge: "Is there a specific case where this rule would fail?"
    },
    {
      textToHighlight: 'never',
      insight: "This uses 'absolute' language like 'always' or 'never'.",
      challenge: "Is there a specific case where this rule would fail?"
    }
  ],
  Teacher: [
    {
      textToHighlight: 'core concept',
      insight: "This is a core concept that often appears on final exams.",
      challenge: "How would you rewrite this sentence using your own words?"
    }
  ],
  Auditor: [
    {
      textToHighlight: 'efficiency',
      insight: "Efficiency claims should be backed by measurable metrics.",
      challenge: "What data points could prove this efficiency?"
    }
  ]
};

const DEFAULT_TEXT = "The foundational principles of effective project management are rooted in comprehensive planning. It is always necessary to maintain a strict schedule, as delays will never be tolerated. This is a core concept that you must understand to improve efficiency.";

export default function Reader() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isEditing, setIsEditing] = useState(false);
  const [activeLens, setActiveLens] = useState<LensType>('None');
  const [activeHighlight, setActiveHighlight] = useState<HighlightDef | null>(null);

  const renderHighlightedText = () => {
    if (activeLens === 'None' || !LENSES[activeLens]) return <p className="whitespace-pre-wrap">{text}</p>;
    
    const highlights = LENSES[activeLens];
    const regexStr = highlights.map(h => h.textToHighlight).join('|');
    const regex = new RegExp(`(${regexStr})`, 'gi');
    
    const parts = text.split(regex);
    
    return (
      <p className="whitespace-pre-wrap leading-relaxed space-y-4">
        {parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          const match = highlights.find(h => h.textToHighlight === lowerPart);
          if (match) {
            return (
              <span 
                key={i} 
                className="perspective-highlight cursor-pointer relative text-yellow-200"
                onClick={() => setActiveHighlight(match)}
              >
                {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden relative">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Reader</h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <button 
               className="text-[11px] font-medium uppercase tracking-wider text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors"
               onClick={() => setIsEditing(false)}
            >
              Done Editing
            </button>
          ) : (
            <button 
               className="text-[11px] font-medium uppercase tracking-wider text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
               onClick={() => { setIsEditing(true); setActiveHighlight(null); }}
            >
              <span className="material-symbols-outlined text-[14px]">edit</span>
              Edit
            </button>
          )}

          <div className="relative group flex items-center">
            <select 
              className="text-xs text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors outline-none cursor-pointer appearance-none pr-8 font-medium"
              value={activeLens}
              aria-label="Perspective Lens"
              title="Perspective Lens"
              onChange={(e) => {
                setActiveLens(e.target.value as LensType);
                setActiveHighlight(null);
                if (e.target.value !== 'None') setIsEditing(false); // force reading mode when picking a lens
              }}
            >
              <option value="None">Lens: None</option>
              <option value="Skeptic">Lens: Skeptic</option>
              <option value="Teacher">Lens: Teacher</option>
              <option value="Auditor">Lens: Auditor</option>
            </select>
            <span className="material-symbols-outlined text-[16px] absolute right-2.5 pointer-events-none text-zinc-400">expand_more</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 font-serif text-[#c0c0c0] text-lg bg-[#181818]">
        {isEditing ? (
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none font-serif text-lg text-zinc-200 leading-relaxed placeholder:text-zinc-600 custom-scrollbar"
            placeholder="Paste your reading text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          renderHighlightedText()
        )}
      </div>

      {/* Popover for active highlight */}
      {activeHighlight && !isEditing && (
        <div className="absolute bottom-6 left-6 right-6 bg-[#222222] border border-[#3a3a3a] rounded-lg p-5 shadow-2xl z-20 flex flex-col gap-4 font-sans ring-1 ring-black/50">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] uppercase tracking-widest font-bold text-yellow-500 flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">lightbulb</span>
               Insight
            </h3>
            <button onClick={() => setActiveHighlight(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <p className="text-[15px] leading-relaxed text-zinc-300 -mt-2">{activeHighlight.insight}</p>
          
          <div className="h-px w-full bg-[#3a3a3a] my-1" />
          
          <h3 className="text-[13px] uppercase tracking-widest font-bold text-rose-400 flex items-center gap-2">
             <span className="material-symbols-outlined text-[18px]">psychology_alt</span>
             Challenge
          </h3>
          <p className="text-[15px] leading-relaxed text-zinc-300 -mt-2">{activeHighlight.challenge}</p>
        </div>
      )}
    </section>
  );
}
