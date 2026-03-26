"use client";

import React, { useEffect, useRef, useState } from "react";

export interface HighlightDef {
  textToHighlight: string;
  insight: string;
  example: string;
  challenge: string;
}

interface InsightInspectorProps {
  highlight: HighlightDef;
  onClose: () => void;
}

const STORAGE_KEY = "thoughtful_inspector_pos";
const INSPECTOR_WIDTH = 340;

export default function InsightInspector({ highlight, onClose }: InsightInspectorProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hasMounted, setHasMounted] = useState(false);

  const isDragging = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartPos = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── Initialize Position ──────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const w = window.innerWidth;
    const h = window.innerHeight;

    let initX = w - INSPECTOR_WIDTH - 24; // Default to right side
    let initY = 24; // Default to top

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          initX = parsed.x;
          initY = parsed.y;
        }
      } catch {
        // invalid JSON
      }
    }

    // Clamp initial to viewport
    initX = Math.max(0, Math.min(initX, w - INSPECTOR_WIDTH));
    initY = Math.max(0, Math.min(initY, h - 100)); // Roughly header height

    setPosition({ x: initX, y: initY });
    setHasMounted(true);
  }, []);

  const headerRef = useRef<HTMLDivElement>(null);

  // ─── Dragging Logic ───────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = true;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartPos.current = { x: position.x, y: position.y };
    if (headerRef.current) {
      headerRef.current.setPointerCapture(e.pointerId);
    }
    e.stopPropagation();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    let newX = windowStartPos.current.x + dx;
    let newY = windowStartPos.current.y + dy;

    // Clamp to viewport
    const w = window.innerWidth;
    const h = window.innerHeight;
    const bounds = containerRef.current?.getBoundingClientRect() || { width: INSPECTOR_WIDTH, height: 100 };

    newX = Math.max(0, Math.min(newX, w - bounds.width));
    newY = Math.max(0, Math.min(newY, h - Math.min(bounds.height, isMinimized ? 40 : 100)));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (headerRef.current) {
      headerRef.current.releasePointerCapture(e.pointerId);
    }
  };

  // We save the position to localStorage explicitly when dragging stops
  useEffect(() => {
    if (!isDragging.current && hasMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    }
  }, [position, hasMounted]);

  if (!hasMounted) return null; // Avoid hydration mismatch on initial render

  return (
    <div
      ref={containerRef}
      className={`fixed z-[100] flex flex-col backdrop-blur-md shadow-2xl transition-[height] duration-300 font-sans border border-[#2d2d2d] bg-[#121212]/85 overflow-hidden ${
        isMinimized ? "rounded-full" : "rounded-xl"
      }`}
      style={{
        width: INSPECTOR_WIDTH,
        top: position.y,
        left: position.x,
        // When grabbing we disable transitions for instant tracking
        transitionProperty: isDragging.current ? "none" : "border-radius, height, background-color",
      }}
    >
      {/* ── Grab Bar / Header ── */}
      <div 
        ref={headerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a]/90 shrink-0 cursor-move border-b border-[#2d2d2d]/50 group select-none touch-none"
      >
        <div className="flex flex-col gap-0.5 justify-center opacity-50 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-px bg-zinc-500 rounded-full" />
          <div className="w-8 h-px bg-zinc-500 rounded-full" />
          <div className="w-8 h-px bg-zinc-500 rounded-full" />
        </div>
        
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400">
          Inspector
        </span>

        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <span className="material-symbols-outlined text-[13px]">{isMinimized ? "unfold_more" : "remove"}</span>
          </button>
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-900/50 hover:bg-rose-800 text-rose-400 transition-colors"
            title="Close"
          >
            <span className="material-symbols-outlined text-[13px]">close</span>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      {!isMinimized && (
        <div 
          className="flex flex-col gap-5 px-5 py-5 overflow-y-auto custom-scrollbar" 
          style={{ maxHeight: Math.min(window.innerHeight - position.y - 50, 600) }}
          onPointerDown={(e) => e.stopPropagation()} // Allow text selection without dragging
        >
          {/* Concept */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-yellow-400">lightbulb</span>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-yellow-400">The Concept</h3>
            </div>
            <p className="text-[12.5px] leading-relaxed text-zinc-300">{highlight.insight}</p>
          </div>

          <div className="h-px bg-[#2d2d2d]" />

          {/* Simple Example */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-sky-400">child_care</span>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-sky-400">ELI10 Example</h3>
            </div>
            <p className="text-[12.5px] leading-relaxed text-zinc-400 italic">{highlight.example}</p>
          </div>

          <div className="h-px bg-[#2d2d2d]" />

          {/* Socratic Challenge */}
          <div className="pb-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-[16px] text-rose-400">psychology_alt</span>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-rose-400">The Challenge</h3>
            </div>
            <p className="text-[12.5px] leading-relaxed text-zinc-300">{highlight.challenge}</p>
          </div>
        </div>
      )}
    </div>
  );
}
