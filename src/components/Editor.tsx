"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ScaffoldNode } from "@/lib/db";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Provocation {
  id: string;
  sentence: string;
  question: string;
  nodeId: string | null;
  nodeTitle: string | null;
  nodeEvidence: string | null;
  nodeClaim: string | null;
  resolved: boolean;
}

interface EditorProps {
  nodes: ScaffoldNode[];
  isUnlocked: boolean;
  completedCount: number;
  gateThreshold: number;
}

const INITIAL_CONTENT =
  "The evolution of project management paradigms reflects a broader shift towards data-driven and socially responsible frameworks.\n\nAs indicated by recent academic discourse, the effective integration of artificial intelligence and global sustainability goals are now foundational to modern project execution.\n\nThis requires project leaders to not only master technical analytical tools but also to foster adaptive, collaborative team environments that can navigate complexity.\n\nFurthermore, the professional development landscape is adapting, with certification paths increasingly emphasizing these contemporary competencies.";

const WORD_TRIGGER = 10;
const PAUSE_TRIGGER_MS = 3000;

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Editor({ nodes, isUnlocked, completedCount, gateThreshold }: EditorProps) {
  const [content, setContent] = useState(INITIAL_CONTENT);
  const [provocations, setProvocations] = useState<Provocation[]>([]);
  const [activeProvocation, setActiveProvocation] = useState<Provocation | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [wordCount, setWordCount] = useState(() => countWords(INITIAL_CONTENT));

  const lastWordCountAtTrigger = useRef(countWords(INITIAL_CONTENT));
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFetching = useRef(false);

  const remaining = Math.max(0, gateThreshold - completedCount);

  // ── Coach API call ──────────────────────────────────────────────────────────
  const runCoach = useCallback(
    async (text: string) => {
      if (isFetching.current) return;
      isFetching.current = true;
      setIsChecking(true);
      try {
        const res = await fetch("/api/editor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentDraft: text, scaffoldNodes: nodes }),
        });
        const data = await res.json();
        
        if (!res.ok || data.error) {
          // If offline or error, we could show a silent margin error, but we fail gracefully
          return;
        }

        if (data?.challenge && data.challenge.trim() !== '') {
          const p: Provocation = {
            id: `prov_${Date.now()}`,
            sentence: data.sentence || "General logic check",
            question: data.challenge,
            nodeId: null, // we don't strictly need the ID for display
            nodeTitle: data.nodeTitle || null,
            nodeEvidence: data.nodeEvidence || null,
            nodeClaim: data.nodeClaim || null,
            resolved: false,
          };
          setProvocations((prev) => {
            const exists = prev.some((x) => x.sentence === p.sentence && !x.resolved);
            return exists ? prev : [...prev, p];
          });
          setActiveProvocation(p);
        }
      } catch {
        /* silent */
      } finally {
        isFetching.current = false;
        setIsChecking(false);
        lastWordCountAtTrigger.current = countWords(text);
      }
    },
    [nodes]
  );

  // ── Input handler ───────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setContent(newText);
    const newWords = countWords(newText);
    setWordCount(newWords);

    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    if (newWords - lastWordCountAtTrigger.current >= WORD_TRIGGER) {
      runCoach(newText);
    } else {
      pauseTimerRef.current = setTimeout(() => runCoach(newText), PAUSE_TRIGGER_MS);
    }
  };

  useEffect(() => () => { if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); }, []);

  const activeProvocations = provocations.filter((p) => !p.resolved);

  const resolveProvocation = (id: string) => {
    setProvocations((prev) => prev.map((p) => (p.id === id ? { ...p, resolved: true } : p)));
    if (activeProvocation?.id === id) setActiveProvocation(null);
  };

  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden relative">
      {/* Header */}
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Editor</h2>
        <div className="flex items-center gap-3">
          {isChecking && (
            <span className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium">
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
              Lurking AI…
            </span>
          )}
          {isUnlocked && activeProvocations.length > 0 && (
            <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">warning</span>
              {activeProvocations.length} challenge{activeProvocations.length !== 1 ? "s" : ""}
            </span>
          )}
          {isUnlocked && activeProvocations.length === 0 && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
              <span className="material-symbols-outlined text-[13px]">lock_open</span>
              Unlocked
            </span>
          )}
        </div>
      </header>

      {/* Body: textarea + margin */}
      <div className="flex-1 flex overflow-hidden relative">
        <textarea
          className={`flex-1 resize-none outline-none bg-transparent p-8 font-serif text-[1.05rem] leading-[1.85] custom-scrollbar transition-all duration-500 ${
            isUnlocked
              ? "text-[#f0f0f0] placeholder:text-zinc-600"
              : "text-zinc-600 pointer-events-none select-none"
          }`}
          value={content}
          onChange={handleChange}
          readOnly={!isUnlocked}
          placeholder="Start writing your argument here…"
          spellCheck={true}
        />

        {/* Provocation Margin */}
        <div className="w-[60px] shrink-0 border-l academic-border flex flex-col items-center pt-8 gap-4">
          {isUnlocked &&
            activeProvocations.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveProvocation(activeProvocation?.id === p.id ? null : p)}
                className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-150 ${
                  activeProvocation?.id === p.id
                    ? "bg-rose-500/20 ring-1 ring-rose-500/50"
                    : "bg-rose-900/20 hover:bg-rose-500/20 ring-1 ring-rose-800/40 hover:ring-rose-500/50"
                }`}
                title={p.sentence.substring(0, 60) + "…"}
              >
                <span className="material-symbols-outlined text-[15px] text-rose-400">warning</span>
              </button>
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

      {/* Active Provocation Card */}
      {activeProvocation && !activeProvocation.resolved && isUnlocked && (
        <div className="border-t border-[#333] bg-[#1a1a1a] px-5 py-4 font-sans flex flex-col gap-4 max-h-[240px] overflow-y-auto custom-scrollbar shrink-0">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-rose-400">psychology_alt</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
                Lurking AI Challenge
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => resolveProvocation(activeProvocation.id)}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 px-3 py-1.5 rounded transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">check</span>
                Resolve
              </button>
              <button
                onClick={() => setActiveProvocation(null)}
                className="text-zinc-600 hover:text-zinc-300"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>

          <p className="text-[12px] italic text-zinc-500 border-l-2 border-rose-800 pl-3 leading-snug shrink-0">
            &ldquo;{activeProvocation.sentence}&rdquo;
          </p>

          <p className="text-[13.5px] leading-relaxed text-zinc-200 shrink-0">
            {activeProvocation.question}
          </p>

          {activeProvocation.nodeId && (
            <div className="bg-[#222] border border-[#333] rounded-lg p-3 flex flex-col gap-2 shrink-0">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                📎 Your Research Note
              </span>
              {activeProvocation.nodeTitle && (
                <p className="text-[12px] font-semibold text-zinc-300">{activeProvocation.nodeTitle}</p>
              )}
              {activeProvocation.nodeEvidence && (
                <p className="text-[12px] italic text-zinc-400 border-l-2 border-yellow-700/50 pl-2 leading-snug">
                  &ldquo;{activeProvocation.nodeEvidence}&rdquo;
                </p>
              )}
              {activeProvocation.nodeClaim && (
                <p className="text-[12px] text-zinc-400">
                  <span className="text-zinc-500">Your claim: </span>
                  {activeProvocation.nodeClaim}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="h-8 border-t academic-border px-4 flex items-center justify-between shrink-0 bg-[#141414]">
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-medium">
          <span>Words: {wordCount}</span>
          <span>Challenges: {activeProvocations.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500/50"></div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Auto-save On</span>
        </div>
      </footer>
    </section>
  );
}
