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
  onSelect: (targetSentence: string) => void;
}

// ─── Card config ─────────────────────────────────────────────────────────────

const CONFIG: Record<MemoryCardType, {
  label: string;
  icon: string;
  accent: string;
  iconColor: string;
  headerBg: string;
  glowColor: string;
}> = {
  // RED — Fact-Check / Logic errors
  logic_check: {
    label: "Fact Check",
    icon: "gpp_maybe",
    accent: "border-red-500",
    iconColor: "text-red-400",
    headerBg: "bg-red-950/40",
    glowColor: "shadow-[0_0_12px_rgba(239,68,68,0.18)]",
  },
  // BLUE — Memory Recall / Evidence gaps
  evidence_gap: {
    label: "Memory Recall",
    icon: "menu_book",
    accent: "border-blue-400",
    iconColor: "text-blue-400",
    headerBg: "bg-blue-950/30",
    glowColor: "shadow-[0_0_12px_rgba(96,165,250,0.18)]",
  },
  // YELLOW — ELI10 / Lemonade Stand simplification
  better_way: {
    label: "Lemonade Stand",
    icon: "child_care",
    accent: "border-yellow-400",
    iconColor: "text-yellow-400",
    headerBg: "bg-yellow-950/20",
    glowColor: "shadow-[0_0_12px_rgba(250,204,21,0.15)]",
  },
  sentence_improver: {
    label: "Simplify It",
    icon: "edit_note",
    accent: "border-yellow-400",
    iconColor: "text-yellow-400",
    headerBg: "bg-yellow-950/20",
    glowColor: "shadow-[0_0_12px_rgba(250,204,21,0.15)]",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function MemoryCard({ card, onDismiss, onApply, onSelect }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = CONFIG[card.type];

  const hasExtra = !!(card.eli10Example || card.nodeEvidence || card.sourceFact);

  return (
    <div
      className={`
        w-full rounded-xl border-l-2 ${cfg.accent}
        bg-[#1c1c1e]/90 backdrop-blur-sm border border-white/[0.06]
        ${cfg.glowColor}
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
        {/* Headline — clicking highlights the sentence in the editor */}
        <button
          onClick={() => card.targetSentence && onSelect(card.targetSentence)}
          className="text-left text-[11px] font-semibold text-zinc-200 leading-snug hover:text-white transition-colors"
          title="Click to highlight sentence in editor"
        >
          {card.headline}
        </button>

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
