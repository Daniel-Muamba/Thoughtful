"use client";

import React, { useState } from 'react';

type LensType = 'None' | 'Skeptic' | 'Teacher' | 'Auditor';

interface HighlightDef {
  textToHighlight: string;
  insight: string;
  example: string;
  challenge: string;
}

const LENSES: Record<string, HighlightDef[]> = {
  Skeptic: [
    {
      textToHighlight: 'always',
      insight: "This sentence uses 'absolute' language — words like 'always' or 'never' that leave no room for exceptions.",
      example: "Imagine if you said, 'I ALWAYS win at rock-paper-scissors.' Someone would only need to beat you once to prove you wrong! Absolute words are easy to disprove.",
      challenge: "Is there a specific case where this rule would fail? What would it take to break this 'always'?"
    },
    {
      textToHighlight: 'never',
      insight: "This sentence uses 'absolute' language — words like 'always' or 'never' that leave no room for exceptions.",
      example: "Imagine if you said, 'It will NEVER rain on my birthday.' You'd only need one rainy birthday to prove that wrong! Absolute words are risky.",
      challenge: "Can you think of even one exception to this 'never'? What does that do to the argument's strength?"
    }
  ],
  Teacher: [
    {
      textToHighlight: 'core concept',
      insight: "This is a foundational idea — the kind that everything else in the subject is built upon. You can't skip it.",
      example: "Think of it like learning to ride a bike. Before tricks, you must learn to balance. A 'core concept' is that balance — the thing you must get right before anything else makes sense.",
      challenge: "How would you rewrite this sentence using your own words — without using any of the author's original phrasing?"
    }
  ],
  Auditor: [
    {
      textToHighlight: 'efficiency',
      insight: "This is about 'Opportunity Cost' — when you choose one path, you give up the benefits of the path not taken.",
      example: "If you have $5 and buy a comic book, the 'opportunity cost' is the giant chocolate bar you didn't buy. It's the value of what you gave up by making a choice.",
      challenge: "In this text, what is the author giving up by focusing only on efficiency? What important thing might get ignored?"
    },
    {
      textToHighlight: 'profit',
      insight: "Profit is the financial gain after all costs are deducted. But profit is never 'free' — it always comes at someone's expense.",
      example: "Your lemonade stand made $10, but you spent $4 on lemons and sugar. Your profit is $6. But what if a neighbour's tree had to be cut down for your stand? That's a hidden cost.",
      challenge: "In this article, what is the author giving up by focusing only on profit instead of the environment?"
    }
  ]
};

const DEFAULT_TEXT = "The foundational principles of effective project management demand efficiency at all times. It is always necessary to maintain a strict schedule, as delays will never be tolerated. Understanding this core concept is what separates good managers from great ones. The drive for profit often shapes these decisions more than any other factor.";

interface ReaderProps {
  onAddToScaffold?: (quote: string) => void;
}

export default function Reader({ onAddToScaffold }: ReaderProps) {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isEditing, setIsEditing] = useState(false);
  const [activeLens, setActiveLens] = useState<LensType>('None');
  const [activeHighlight, setActiveHighlight] = useState<HighlightDef | null>(null);
  const [selection, setSelection] = useState<{ text: string; x: number; y: number } | null>(null);

  const renderHighlightedText = () => {
    if (activeLens === 'None' || !LENSES[activeLens]) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }

    const highlights = LENSES[activeLens];
    const regexStr = highlights.map(h => h.textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${regexStr})`, 'gi');
    const parts = text.split(regex);

    return (
      <p className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          const match = highlights.find(h => h.textToHighlight === lowerPart);
          if (match) {
            const isActive = activeHighlight === match;
            return (
              <span
                key={i}
                className={`perspective-highlight cursor-pointer transition-all duration-150 ${isActive ? 'text-yellow-200 brightness-125' : 'text-yellow-100'}`}
                onClick={() => setActiveHighlight(isActive ? null : match)}
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
      {/* Header */}
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0 gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 shrink-0">The Reader</h2>
        <div className="flex items-center gap-2 ml-auto">
          {isEditing ? (
            <button
              className="text-[11px] font-medium uppercase tracking-wider text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 px-3 py-1.5 rounded transition-colors"
              onClick={() => { setIsEditing(false); setActiveHighlight(null); }}
            >
              Done
            </button>
          ) : (
            <button
              className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
              onClick={() => { setIsEditing(true); setActiveHighlight(null); }}
            >
              <span className="material-symbols-outlined text-[13px]">edit</span>
              Edit
            </button>
          )}

          <div className="relative flex items-center">
            <select
              className="text-xs text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 pl-3 pr-8 py-1.5 rounded transition-colors outline-none cursor-pointer appearance-none font-medium"
              value={activeLens}
              aria-label="Perspective Lens"
              title="Perspective Lens"
              onChange={(e) => {
                setActiveLens(e.target.value as LensType);
                setActiveHighlight(null);
                if (e.target.value !== 'None') setIsEditing(false);
              }}
            >
              <option value="None">Lens: None</option>
              <option value="Skeptic">Lens: Skeptic</option>
              <option value="Teacher">Lens: Teacher</option>
              <option value="Auditor">Lens: Auditor</option>
            </select>
            <span className="material-symbols-outlined text-[15px] absolute right-2 pointer-events-none text-zinc-400">expand_more</span>
          </div>
        </div>
      </header>

      {/* Text Body */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-6 font-serif text-[#c0c0c0] text-[1.05rem] bg-[#181818] leading-[1.85] relative"
        onClick={(e) => {
          if (e.target === e.currentTarget) { setActiveHighlight(null); setSelection(null); }
        }}
        onMouseUp={(e) => {
          if (isEditing) return;
          const sel = window.getSelection();
          const selected = sel?.toString().trim() ?? '';
          if (selected.length > 3) {
            setSelection({ text: selected, x: e.clientX, y: e.clientY });
          } else {
            setSelection(null);
          }
        }}
      >
        {isEditing ? (
          <textarea
            className="w-full h-full bg-transparent resize-none outline-none font-serif text-[1.05rem] text-zinc-200 leading-[1.85] placeholder:text-zinc-600"
            placeholder="Paste your reading text here, then select a Lens to start highlighting..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        ) : (
          renderHighlightedText()
        )}
      </div>

      {/* Floating "Add to Scaffold" button on text selection */}
      {selection && !isEditing && onAddToScaffold && (
        <div
          className="fixed z-30 pointer-events-none"
          style={{ top: selection.y + 10, left: selection.x }}
        >
          <button
            className="pointer-events-auto bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 text-[11px] font-semibold px-3 py-1.5 rounded shadow-xl flex items-center gap-1.5 transition-colors"
            onMouseDown={(e) => {
              e.preventDefault(); // keep selection alive
              onAddToScaffold(selection.text);
              setSelection(null);
              window.getSelection()?.removeAllRanges();
            }}
          >
            <span className="material-symbols-outlined text-[14px] text-yellow-400">add</span>
            Add to Scaffold
          </button>
        </div>
      )}

      {/* Three-section Insight Popover */}
      {activeHighlight && !isEditing && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#1c1c1c] border-t border-[#333] z-20 font-sans shadow-2xl flex flex-col max-h-[55%]">
          {/* Popover Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#2a2a2a] shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Lens: {activeLens}
            </span>
            <button
              onClick={() => setActiveHighlight(null)}
              className="text-zinc-600 hover:text-zinc-300 transition-colors ml-auto"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Popover Content — scrollable */}
          <div className="overflow-y-auto custom-scrollbar px-5 py-4 flex flex-col gap-5">

            {/* Section 1 — Insight */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px] text-yellow-400">lightbulb</span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-400">The Concept</h3>
              </div>
              <p className="text-[13.5px] leading-relaxed text-zinc-200">{activeHighlight.insight}</p>
            </div>

            <div className="h-px bg-[#2d2d2d]" />

            {/* Section 2 — ELI10 Example */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px] text-sky-400">child_care</span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-400">Simple Example (ELI10)</h3>
              </div>
              <p className="text-[13.5px] leading-relaxed text-zinc-300 italic">{activeHighlight.example}</p>
            </div>

            <div className="h-px bg-[#2d2d2d]" />

            {/* Section 3 — Challenge */}
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px] text-rose-400">psychology_alt</span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-400">The Challenge</h3>
              </div>
              <p className="text-[13.5px] leading-relaxed text-zinc-200">{activeHighlight.challenge}</p>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
