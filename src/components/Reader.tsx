"use client";

import React, { useEffect, useRef, useState } from 'react';
import SourceUpload from './SourceUpload';
import InsightInspector from './InsightInspector';

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
  error?: string;
}

interface ReaderProps {
  activeSessionId: string | null;
  onAddToScaffold?: (quote: string) => void;
}

const DEFAULT_TEXT =
  "The foundational principles of effective project management demand efficiency at all times. It is always necessary to maintain a strict schedule, as delays will never be tolerated. Understanding this core concept is what separates good managers from great ones. The drive for profit often shapes these decisions more than any other factor.";

// ─── Component ────────────────────────────────────────────────────────────────

export default function Reader({ activeSessionId, onAddToScaffold }: ReaderProps) {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isEditing, setIsEditing] = useState(false);
  const [activeLens, setActiveLens] = useState<LensType>('None');
  const [activeHighlight, setActiveHighlight] = useState<HighlightDef | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Dynamic Hotspots
  const [dynamicHotspots, setDynamicHotspots] = useState<HighlightDef[]>([]);
  const [isFetchingHotspots, setIsFetchingHotspots] = useState(false);

  // Selection toolbar
  const [selRect, setSelRect] = useState<SelectionRect | null>(null);
  const [eli10, setEli10] = useState<ELI10State>({ loading: false, explanation: null });

  const containerRef = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // ── Load source text on mount or session change ────────────────────────────
  useEffect(() => {
    if (!activeSessionId) return;
    fetch('/api/session')
      .then((res) => res.json())
      .then((data) => {
        const session = data?.sessions?.find((s: any) => s.id === activeSessionId);
        if (session && session.source_text) {
          setText(session.source_text);
        } else {
          setText(""); // clear text if new session
        }
      })
      .catch(() => {});
  }, [activeSessionId]);

  // ── Handle importing text from SourceUpload ────────────────────────────────
  const handleImport = async (importedText: string) => {
    setText(importedText);
    setIsUploadOpen(false);
    
    // Save to persistence
    if (!activeSessionId) return;
    try {
      const dbRes = await fetch('/api/session');
      const dbData = await dbRes.json();
      const sessions = dbData.sessions || [];
      const session = sessions.find((s: any) => s.id === activeSessionId);
      
      if (session) {
        session.source_text = importedText;
      }
      
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions }),
      });
    } catch {
      /* silent */
    }
  };

  // ── Fetch Dynamic Hotspots ─────────────────────────────────────────────────
  useEffect(() => {
    if (activeLens === 'None' || isEditing || text.trim().length === 0) {
      setDynamicHotspots([]);
      return;
    }
    
    // Slight debounce when updating to avoid spamming the API
    const timeoutId = setTimeout(async () => {
      setIsFetchingHotspots(true);
      try {
        const res = await fetch('/api/hotspots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceText: text, activeLens })
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDynamicHotspots(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic hotspots", err);
      } finally {
        setIsFetchingHotspots(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [text, activeLens, isEditing]);

  // ── Set dynamic positioning for toolbar ──────────────────────────────────
  useEffect(() => {
    if (toolbarRef.current && selRect) {
      toolbarRef.current.style.top = `${selRect.top - 8}px`;
      toolbarRef.current.style.left = `${selRect.cx}px`;
      toolbarRef.current.style.transform = 'translate(-50%, -100%)';
    }
  }, [selRect]);

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

  // ── Gemini Reader API fetch ──────────────────────────────────────────────
  const handleExplain = async () => {
    if (!selRect) return;
    setEli10({ loading: true, explanation: null, error: undefined });
    try {
      const res = await fetch('/api/reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedText: selRect.text, activeLens }),
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setEli10({ loading: false, explanation: null, error: data.error || 'AI is offline' });
        return;
      }

      // We have dynamic insight, example, challenge!
      // Display it in the main Lens Hotspot Popover 
      setActiveHighlight({
        textToHighlight: selRect.text,
        insight: data.insight,
        example: data.example,
        challenge: data.challenge,
      });
      dismissToolbar();
      
    } catch {
      setEli10({ loading: false, explanation: null, error: 'AI is offline' });
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
    if (activeLens === 'None' || dynamicHotspots.length === 0) {
      return (
        <p className="whitespace-pre-wrap">
          {isFetchingHotspots && <span className="block mb-2 text-sm text-yellow-400/80 italic animate-pulse">Analyzing text with Gemini for {activeLens} insights...</span>}
          {text}
        </p>
      );
    }
    
    const highlights = dynamicHotspots;
    // Map text blocks safely escaping regex properly
    const regexStr = highlights
      .map((h) => h.textToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const regex = new RegExp(`(${regexStr})`, 'gi');
    const parts = text.split(regex);

    return (
      <div className="relative">
        {isFetchingHotspots && <p className="mb-2 text-sm text-yellow-400/80 italic animate-pulse">Analyzing text with Gemini for {activeLens} insights...</p>}
        <p className="whitespace-pre-wrap leading-relaxed">
          {parts.map((part, i) => {
            const match = highlights.find((h) => h.textToHighlight.toLowerCase() === part.toLowerCase());
            if (match) {
              const isActive = activeHighlight === match;
              return (
                <span
                  key={i}
                  className={`perspective-highlight cursor-pointer transition-all duration-150 ${
                    isActive ? 'text-yellow-200 brightness-125 bg-yellow-900/40 rounded px-0.5' : 'text-yellow-100 bg-yellow-900/20 rounded px-0.5'
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
      </div>
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
        <div className="flex items-center gap-3 shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            The Reader
          </h2>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-800/40 hover:bg-zinc-700/60 hover:text-zinc-200 border border-zinc-700/50 px-2.5 py-1 rounded transition-colors"
            title="Import text or PDF"
          >
            <span className="material-symbols-outlined text-[14px]">add_circle</span>
            Add Source
          </button>
        </div>
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
          ref={toolbarRef}
          className="fixed z-50 flex flex-col items-center gap-1.5 pointer-events-none"
        >
          {/* ELI10 / AI Bubble (Loading or Error) */}
          {(eli10.loading || eli10.error || eli10.explanation) && (
            <div className="pointer-events-auto w-72 bg-[#1e1e1e] border border-zinc-700 rounded-xl p-4 shadow-2xl font-sans flex flex-col gap-3 mb-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-sky-400">child_care</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">
                    Lurking AI
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
                  Analyzing with Gemini…
                </div>
              ) : eli10.error ? (
                <div className="flex items-center gap-2 text-rose-400 text-[13px]">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {eli10.error}
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

      {/* ── Movable Insight Inspector ───────────────────────────────────────── */}
      {activeHighlight && !isEditing && (
        <InsightInspector
          highlight={activeHighlight}
          onClose={() => setActiveHighlight(null)}
        />
      )}

      {/* ── Source Upload Modal ─────────────────────────────────────────────── */}
      <SourceUpload
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImport={handleImport}
      />
    </section>
  );
}
