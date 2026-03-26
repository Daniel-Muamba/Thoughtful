"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ScaffoldNode } from "@/lib/db";
import MemoryCard, { type MemoryCardData, type MemoryCardType } from "@/components/MemoryCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EditorProps {
  nodes: ScaffoldNode[];
  isUnlocked: boolean;
  completedCount: number;
  gateThreshold: number;
  sourceContent: string;
}

interface ApiCard {
  type: string;
  targetSentence?: string;
  headline?: string;
  suggestion?: string;
  eli10Example?: string;
  nodeTitle?: string;
  nodeEvidence?: string;
  sourceFact?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_TYPES: MemoryCardType[] = ["better_way", "evidence_gap", "logic_check", "sentence_improver"];

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Returns true when the last non-whitespace character is a sentence terminator */
function endsWithSentence(text: string): boolean {
  return /[.!?]\s*$/.test(text.trimEnd());
}

const INITIAL_CONTENT = "";

const COOLDOWN_MS  = 8000; // min ms between API calls
const PAUSE_MS     = 2000; // idle pause before triggering

// ─── Component ────────────────────────────────────────────────────────────────

export default function Editor({ nodes, isUnlocked, completedCount, gateThreshold, sourceContent }: EditorProps) {
  const [content, setContent]         = useState(INITIAL_CONTENT);
  const [cards, setCards]             = useState<MemoryCardData[]>([]);
  const [overlayCard, setOverlayCard] = useState<MemoryCardData | null>(null);
  const [isChecking, setIsChecking]   = useState(false);
  const [wordCount, setWordCount]     = useState(0);

  const pauseTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetching      = useRef(false);
  const lastCallTime    = useRef(0);          // timestamp of last completed call
  const prevSentenceEnd = useRef(false);      // was the previous state sentence-ended?

  const remaining = Math.max(0, gateThreshold - completedCount);

  // ── Coach API call ──────────────────────────────────────────────────────────
  const runCoach = useCallback(
    async (text: string) => {
      if (isFetching.current) return;
      const now = Date.now();
      if (now - lastCallTime.current < COOLDOWN_MS) return; // cooldown
      if (text.trim().split(/\s+/).filter(Boolean).length < 8) return; // too short

      isFetching.current = true;
      setIsChecking(true);
      try {
        const cleanedSource = sourceContent.replace(/\s+/g, " ").trim();
        const res = await fetch("/api/editor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentDraft: text,
            scaffoldNodes: nodes,
            sourceContent: cleanedSource,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();

        if (Array.isArray(data.cards) && data.cards.length > 0) {
          const newCards: MemoryCardData[] = (data.cards as ApiCard[])
            .filter(c => VALID_TYPES.includes(c.type as MemoryCardType))
            .map((c, i) => ({
              id: `card_${Date.now()}_${i}`,
              type: c.type as MemoryCardType,
              targetSentence: c.targetSentence || "",
              headline: c.headline || "A thought for you",
              suggestion: c.suggestion || "",
              eli10Example: c.eli10Example || undefined,
              nodeTitle: c.nodeTitle || undefined,
              nodeEvidence: c.nodeEvidence || undefined,
              sourceFact: c.sourceFact || undefined,
            }));
          if (newCards.length > 0) {
            setCards(newCards); // replace cards on each cycle — freshest thinking
          }
        }
      } catch {
        /* silent */
      } finally {
        isFetching.current = false;
        lastCallTime.current = Date.now();
        setIsChecking(false);
      }
    },
    [nodes, sourceContent]
  );

  // ── Input handler ───────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);
    setWordCount(countWords(newText));

    // Clear any pending pause timer
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    // Sentence-end trigger: fire immediately when user completes a sentence
    const isSentenceEnd = endsWithSentence(newText);
    if (isSentenceEnd && !prevSentenceEnd.current) {
      // Just typed a sentence terminator — fire after a tiny delay to let them finish
      pauseTimerRef.current = setTimeout(() => runCoach(newText), 500);
    } else {
      // Otherwise fire after 2s of inactivity
      pauseTimerRef.current = setTimeout(() => runCoach(newText), PAUSE_MS);
    }
    prevSentenceEnd.current = isSentenceEnd;
  };

  // Cleanup timer on unmount
  useEffect(() => () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); }, []);

  // Dismiss a specific card
  const dismissCard = (id: string) =>
    setCards(prev => prev.filter(c => c.id !== id));

  // Dismiss overlay on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOverlayCard(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const activeCards = cards; // all cards are "active" — user dismisses manually

  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden relative">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Editor</h2>
        <div className="flex items-center gap-3">
          {isChecking && (
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
              Active Coach…
            </span>
          )}
          {isUnlocked && activeCards.length > 0 && (
            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
              {activeCards.length} suggestion{activeCards.length !== 1 ? "s" : ""}
            </span>
          )}
          {isUnlocked && activeCards.length === 0 && !isChecking && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              Looking good
            </span>
          )}
        </div>
      </header>

      {/* ── Body: textarea + sliding sidebar ────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Writing area */}
        <textarea
          className={`flex-1 resize-none outline-none bg-transparent p-8 font-serif text-[1.05rem] leading-[1.85] custom-scrollbar transition-all duration-500 ${
            isUnlocked
              ? "text-[#f0f0f0] placeholder:text-zinc-600"
              : "text-zinc-600 pointer-events-none select-none"
          }`}
          value={content}
          onChange={handleChange}
          readOnly={!isUnlocked}
          placeholder="Start writing your argument here… The coach will awaken after your first sentence."
          spellCheck={true}
        />

        {/* Memory Card Sidebar — slides in when cards are present */}
        <div
          className={`shrink-0 border-l academic-border flex flex-col gap-3 overflow-y-auto custom-scrollbar py-4 px-3 transition-all duration-300 ${
            isUnlocked && activeCards.length > 0 ? "w-64 opacity-100" : "w-0 opacity-0 px-0"
          }`}
        >
          {isUnlocked && activeCards.map(card => (
            <MemoryCard
              key={card.id}
              card={card}
              onDismiss={dismissCard}
              onApply={setOverlayCard}
            />
          ))}
        </div>

        {/* Gatekeeper Overlay */}
        {!isUnlocked && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-md bg-[#121212]/65">
            <span className="material-symbols-outlined text-[48px] text-zinc-500">lock</span>
            <p className="text-sm font-semibold text-zinc-300 tracking-wide">Thinking Required</p>
            <p className="text-xs text-zinc-500 leading-relaxed text-center max-w-[220px]">
              Complete{" "}
              <span className="text-yellow-400 font-bold">
                {remaining} more node{remaining !== 1 ? "s" : ""}
              </span>{" "}
              in the Scaffolder to unlock writing.
            </p>
            <div className="flex gap-2 mt-1">
              {Array.from({ length: gateThreshold }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-500 ${
                    i < completedCount ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="h-8 border-t academic-border px-4 flex items-center justify-between shrink-0 bg-[#141414]">
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-medium">
          <span>Words: {wordCount}</span>
          <span>Suggestions: {activeCards.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Auto-save On</span>
        </div>
      </footer>

      {/* ── Apply Concept Overlay (bottom-right floating card) ───────────── */}
      {overlayCard && (
        <div className="absolute bottom-12 right-4 z-50 w-72 bg-[#111]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">open_in_new</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Reference — {overlayCard.headline}
              </span>
            </div>
            <button
              onClick={() => setOverlayCard(null)}
              className="text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">close</span>
            </button>
          </div>
          <div className="flex flex-col gap-3 px-4 py-4 max-h-64 overflow-y-auto custom-scrollbar">
            {overlayCard.eli10Example && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-sky-400/70 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">child_care</span>ELI10 Analogy
                </p>
                <p className="text-[12px] text-sky-300/80 italic leading-relaxed">{overlayCard.eli10Example}</p>
              </div>
            )}
            {overlayCard.nodeEvidence && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-amber-400/70 mb-1">
                  📎 {overlayCard.nodeTitle || "Your Note"}
                </p>
                <p className="text-[12px] italic text-zinc-400 border-l-2 border-amber-700/40 pl-2 leading-relaxed">
                  &ldquo;{overlayCard.nodeEvidence}&rdquo;
                </p>
              </div>
            )}
            {overlayCard.sourceFact && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[11px]">menu_book</span>From Source
                </p>
                <p className="text-[12px] text-zinc-400 leading-relaxed">{overlayCard.sourceFact}</p>
              </div>
            )}
            <p className="text-[10px] text-zinc-600 italic mt-1">Press Esc to close</p>
          </div>
        </div>
      )}
    </section>
  );
}
