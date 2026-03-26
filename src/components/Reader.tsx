"use client";

import React, { useEffect, useRef, useState } from 'react';

type LensType = 'None' | 'Skeptic' | 'Teacher' | 'Auditor';

interface HighlightDef {
  textToHighlight: string;
  insight: string;
  example: string;
  challenge: string;
}

interface SelectionRect {
  text: string;
  /** Center X of the selection in viewport coords */
  cx: number;
  /** Top Y of the selection in viewport coords */
  top: number;
}

interface ELI10State {
  loading: boolean;
  explanation: string | null;
}

interface ReaderProps {
  onAddToScaffold?: (quote: string) => void;
}

// ─── Lens Definitions ────────────────────────────────────────────────────────

const LENSES: Record<string, HighlightDef[]> = {
  Skeptic: [
    {
      textToHighlight: 'always',
      insight: "This sentence uses 'absolute' language — words like 'always' or 'never' that leave no room for exceptions.",
      example: "Imagine if you said, 'I ALWAYS win at rock-paper-scissors.' Someone would only need to beat you once to prove you wrong!",
      challenge: "Is there a specific case where this rule would fail? What would it take to break this 'always'?"
    },
    {
      textToHighlight: 'never',
      insight: "This sentence uses 'absolute' language — words like 'always' or 'never' that leave no room for exceptions.",
      example: "Imagine if you said, 'It will NEVER rain on my birthday.' You'd only need one rainy birthday to prove that wrong!",
      challenge: "Can you think of even one exception to this 'never'? What does that do to the argument's strength?"
    }
  ],
  Teacher: [
    {
      textToHighlight: 'core concept',
      insight: "This is a foundational idea — the kind that everything else in the subject is built upon.",
      example: "Think of it like learning to ride a bike. Before tricks, you must learn to balance. A 'core concept' is that balance.",
      challenge: "How would you rewrite this sentence using your own words — without using any of the author's original phrasing?"
    }
  ],
  Auditor: [
    {
      textToHighlight: 'efficiency',
      insight: "This is about 'Opportunity Cost' — when you choose one path, you give up the benefits of the path not taken.",
      example: "If you have $5 and buy a comic book, the 'opportunity cost' is the giant chocolate bar you didn't buy.",
      challenge: "In this text, what is the author giving up by focusing only on efficiency?"
    },
    {
      textToHighlight: 'profit',
      insight: "Profit is the financial gain after all costs are deducted. But profit is never 'free' — it always comes at someone's expense.",
      example: "Your lemonade stand made $10, but you spent $4 on lemons and sugar. Your profit is $6. But what about hidden costs?",
      challenge: "In this article, what is the author giving up by focusing only on profit instead of the environment?"
    }
  ]
};

const DEFAULT_TEXT =
  "The foundational principles of effective project management demand efficiency at all times. It is always necessary to maintain a strict schedule, as delays will never be tolerated. Understanding this core concept is what separates good managers from great ones. The drive for profit often shapes these decisions more than any other factor.";

// ─── Component ────────────────────────────────────────────────────────────────

export default function Reader({ onAddToScaffold }: ReaderProps) {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isEditing, setIsEditing] = useState(false);
  const [activeLens, setActiveLens] = useState<LensType>('None');
  const [activeHighlight, setActiveHighlight] = useState<HighlightDef | null>(null);

  // Selection toolbar
  const [selRect, setSelRect] = useState<SelectionRect | null>(null);
  const [eli10, setEli10] = useState<ELI10State>({ loading: false, explanation: null });

  const containerRef = useRef<HTMLElement>(null);

  // ── Dismiss toolbar + bubble on Escape or outside click ────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelRect(null); setEli10({ loading: false, explanation: null }); }
    };
    const onPointerDown = (e: PointerEvent) => {
      // If the click is outside the container, dismiss
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelRect(null);
        setEli10({ loading: false, explanation: null });
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, []);

  // ── Mouse-up handler to detect selection ───────────────────────────────────
  const handleMouseUp = () => {
    if (isEditing) return;
    const sel = window.getSelection();
    const selectedText = sel?.toString().trim() ?? '';
    if (selectedText.length < 4 || !sel || sel.rangeCount === 0) {
      setSelRect(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setSelRect({
      text: selectedText,
      cx: rect.left + rect.width / 2,
      top: rect.top,
    });
    setEli10({ loading: false, explanation: null });
  };

  // ── ELI10 fetch ────────────────────────────────────────────────────────────
  const handleExplain = async () => {
    if (!selRect) return;
    setEli10({ loading: true, explanation: null });
    try {
      const res = await fetch('/api/eli10', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: selRect.text }),
      });
      const data = await res.json();
      setEli10({ loading: false, explanation: data.explanation ?? 'No explanation returned.' });
    } catch {
      setEli10({ loading: false, explanation: 'Could not reach the AI. Please try again.' });
    }
  };

  // ── Scaffold action ─────────────────────────────────────────────────────────
  const handleScaffold = () => {
    if (!selRect) return;
    onAddToScaffold?.(selRect.text);
    setSelRect(null);
    setEli10({ loading: false, explanation: null });
    window.getSelection()?.removeAllRanges();
  };

  // ── Dismiss toolbar (without action) ───────────────────────────────────────
  const dismissToolbar = () => {
    setSelRect(null);
    setEli10({ loading: false, explanation: null });
    window.getSelection()?.removeAllRanges();
  };

  // ── Render highlighted text ─────────────────────────────────────────────────
  const renderHighlightedText = () => {
    if (activeLens === 'None' || !LENSES[activeLens]) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }
    const highlights = LENSES[activeLens];
    const regexStr = highlights
      .map((h) => h.textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const regex = new RegExp(`(${regexStr})`, 'gi');
    const parts = text.split(regex);

    return (
      <p className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          const match = highlights.find((h) => h.textToHighlight === part.toLowerCase());
          if (match) {
            const isActive = activeHighlight === match;
            return (
              <span
                key={i}
                className={`perspective-highlight cursor-pointer transition-all duration-150 ${
                  isActive ? 'text-yellow-200 brightness-125' : 'text-yellow-100'
                }`}
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

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <section
      ref={containerRef}
      className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden relative"
    >
      {/* Header */}
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0 gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 shrink-0">
          The Reader
        </h2>
        <div className="flex items-center gap-2 ml-auto">
          {isEditing ? (
            <button
              className="text-[11px] font-medium uppercase tracking-wider text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 px-3 py-1.5 rounded transition-colors"
              onClick={() => { setIsEditing(false); setActiveHighlight(null); dismissToolbar(); }}
            >
              Done
            </button>
          ) : (
            <button
              className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
              onClick={() => { setIsEditing(true); setActiveHighlight(null); dismissToolbar(); }}
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
                dismissToolbar();
                if (e.target.value !== 'None') setIsEditing(false);
              }}
            >
              <option value="None">Lens: None</option>
              <option value="Skeptic">Lens: Skeptic</option>
              <option value="Teacher">Lens: Teacher</option>
              <option value="Auditor">Lens: Auditor</option>
            </select>
            <span className="material-symbols-outlined text-[15px] absolute right-2 pointer-events-none text-zinc-400">
              expand_more
            </span>
          </div>
        </div>
      </header>

      {/* Text Body */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar p-6 font-serif text-[#c0c0c0] text-[1.05rem] bg-[#181818] leading-[1.85]"
        onMouseUp={handleMouseUp}
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

      {/* ── Floating Toolbar (fixed, centered above selection) ─────────────── */}
      {selRect && !isEditing && (
        <div
          className="fixed z-50 flex flex-col items-center gap-1.5 pointer-events-none"
          style={{ top: selRect.top - 8, left: selRect.cx, transform: 'translate(-50%, -100%)' }}
        >
          {/* ELI10 Speech Bubble */}
          {(eli10.loading || eli10.explanation) && (
            <div className="pointer-events-auto w-72 bg-[#1e1e1e] border border-zinc-700 rounded-xl p-4 shadow-2xl font-sans flex flex-col gap-3 mb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-sky-400">child_care</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                    Lurking AI · ELI10
                  </span>
                </div>
                <button
                  onClick={dismissToolbar}
                  className="text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>

              {eli10.loading ? (
                <div className="flex items-center gap-2 text-zinc-400 text-[13px]">
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  Thinking…
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed text-zinc-200 italic">
                  {eli10.explanation}
                </p>
              )}
            </div>
          )}

          {/* Toolbar pill */}
          <div className="pointer-events-auto flex items-center gap-0.5 bg-[#252525] border border-zinc-600 rounded-full px-1.5 py-1 shadow-2xl">
            <button
              className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200 hover:text-yellow-300 hover:bg-zinc-700 px-3 py-1.5 rounded-full transition-all duration-150"
              onMouseDown={(e) => { e.preventDefault(); handleExplain(); }}
              title="Explain like I'm 10"
            >
              <span className="material-symbols-outlined text-[15px] text-yellow-400">lightbulb</span>
              Explain
            </button>
            <div className="w-px h-4 bg-zinc-600" />
            <button
              className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200 hover:text-emerald-300 hover:bg-zinc-700 px-3 py-1.5 rounded-full transition-all duration-150"
              onMouseDown={(e) => { e.preventDefault(); handleScaffold(); }}
              title="Add to Scaffolder"
              disabled={!onAddToScaffold}
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-400">add_notes</span>
              Scaffold
            </button>
          </div>

          {/* Caret pointer below pill */}
          <div className="w-2.5 h-2.5 bg-[#252525] border-r border-b border-zinc-600 rotate-45 -mt-2.5" />
        </div>
      )}

      {/* ── Lens Hotspot Popover (unchanged) ──────────────────────────────── */}
      {activeHighlight && !isEditing && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#1c1c1c] border-t border-[#333] z-20 font-sans shadow-2xl flex flex-col max-h-[55%]">
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

          <div className="overflow-y-auto custom-scrollbar px-5 py-4 flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px] text-yellow-400">lightbulb</span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-yellow-400">The Concept</h3>
              </div>
              <p className="text-[13.5px] leading-relaxed text-zinc-200">{activeHighlight.insight}</p>
            </div>
            <div className="h-px bg-[#2d2d2d]" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-[16px] text-sky-400">child_care</span>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-400">Simple Example (ELI10)</h3>
              </div>
              <p className="text-[13.5px] leading-relaxed text-zinc-300 italic">{activeHighlight.example}</p>
            </div>
            <div className="h-px bg-[#2d2d2d]" />
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
