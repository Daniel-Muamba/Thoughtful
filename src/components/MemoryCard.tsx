"use client";

import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MemoryCardType = "better_way" | "evidence_gap" | "logic_check" | "sentence_improver";

export interface MemoryCardData {
  id: string;
  type: MemoryCardType;
  targetSentence: string;
  headline: string;
  suggestion: string;
  eli10Example?: string;
  nodeTitle?: string;
  nodeEvidence?: string;
  sourceFact?: string;
}

interface MemoryCardProps {
  card: MemoryCardData;
  onDismiss: (id: string) => void;
  onApply: (card: MemoryCardData) => void;
}

// ─── Card config ─────────────────────────────────────────────────────────────

const CONFIG: Record<MemoryCardType, {
  label: string;
  icon: string;
  accent: string;      // Tailwind border-l color
  iconColor: string;
  headerBg: string;
}> = {
  logic_check: {
    label: "Logic Check",
    icon: "psychology_alt",
    accent: "border-rose-500",
    iconColor: "text-rose-400",
    headerBg: "bg-rose-950/40",
  },
  evidence_gap: {
    label: "Evidence Gap",
    icon: "search",
    accent: "border-amber-400",
    iconColor: "text-amber-400",
    headerBg: "bg-amber-950/30",
  },
  better_way: {
    label: "Better Way",
    icon: "lightbulb",
    accent: "border-sky-400",
    iconColor: "text-sky-400",
    headerBg: "bg-sky-950/30",
  },
  sentence_improver: {
    label: "Simplify",
    icon: "edit_note",
    accent: "border-violet-400",
    iconColor: "text-violet-400",
    headerBg: "bg-violet-950/30",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MemoryCard({ card, onDismiss, onApply }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = CONFIG[card.type];

  const hasExtra = !!(card.eli10Example || card.nodeEvidence || card.sourceFact);

  return (
    <div
      className={`
        w-full rounded-xl border-l-2 ${cfg.accent}
        bg-[#1c1c1e]/90 backdrop-blur-sm border border-white/[0.06]
        shadow-[0_8px_32px_rgba(0,0,0,0.5)]
        flex flex-col overflow-hidden
        transition-all duration-200 hover:border-white/[0.10]
      `}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-2 ${cfg.headerBg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`material-symbols-outlined text-[13px] shrink-0 ${cfg.iconColor}`}>
            {cfg.icon}
          </span>
          <span className={`text-[9px] font-bold uppercase tracking-widest truncate ${cfg.iconColor}`}>
            {cfg.label}
          </span>
        </div>
        <button
          onClick={() => onDismiss(card.id)}
          className="text-zinc-600 hover:text-zinc-300 transition-colors shrink-0 ml-1"
          title="Dismiss"
        >
          <span className="material-symbols-outlined text-[13px]">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 flex flex-col gap-2">
        {/* Headline */}
        <p className="text-[11px] font-semibold text-zinc-200 leading-snug">
          {card.headline}
        </p>

        {/* Suggestion */}
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          {card.suggestion}
        </p>

        {/* Expandable extra context */}
        {hasExtra && (
          <>
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors self-start"
            >
              <span className="material-symbols-outlined text-[11px]">
                {expanded ? "expand_less" : "expand_more"}
              </span>
              {expanded ? "Less" : "Show context"}
            </button>

            {expanded && (
              <div className="flex flex-col gap-2 mt-0.5">
                {card.eli10Example && (
                  <div className="bg-sky-950/30 border border-sky-900/30 rounded-lg px-2.5 py-2">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-sky-400/70 block mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">child_care</span>
                      ELI10 Reminder
                    </span>
                    <p className="text-[11px] text-sky-300/80 italic leading-snug">
                      {card.eli10Example}
                    </p>
                  </div>
                )}
                {card.nodeEvidence && (
                  <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg px-2.5 py-2">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-amber-400/70 block mb-1">
                      📎 {card.nodeTitle || "Your Note"}
                    </span>
                    <p className="text-[11px] italic text-zinc-400 border-l-2 border-amber-700/40 pl-2 leading-snug">
                      &ldquo;{card.nodeEvidence}&rdquo;
                    </p>
                  </div>
                )}
                {card.sourceFact && (
                  <div className="bg-zinc-800/40 border border-zinc-700/30 rounded-lg px-2.5 py-2">
                    <span className="text-[8.5px] font-bold uppercase tracking-wider text-zinc-500 block mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[10px]">menu_book</span>
                      From Source
                    </span>
                    <p className="text-[11px] text-zinc-400 leading-snug">
                      {card.sourceFact}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Apply Concept button */}
        {hasExtra && (
          <button
            onClick={() => onApply(card)}
            className="mt-0.5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider
              text-emerald-400 bg-emerald-900/20 hover:bg-emerald-900/40
              border border-emerald-800/40 rounded-lg px-2 py-1.5
              transition-colors w-full"
          >
            <span className="material-symbols-outlined text-[11px]">open_in_new</span>
            Apply Concept
          </button>
        )}
      </div>
    </div>
  );
}
