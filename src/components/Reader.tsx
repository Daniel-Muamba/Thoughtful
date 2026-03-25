"use client";

import { useState, useEffect } from "react";

export default function Reader({ session, onChange, onSendToScaffolder }: any) {
  const [isEditing, setIsEditing] = useState(!session?.source_text?.trim());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<{ id: string, text: string } | null>(null);
  const [selectionRange, setSelectionRange] = useState<{ text: string, top: number, left: number } | null>(null);

  const lenses = ["Analytical", "The Skeptic", "The Exam-Maker", "The Business Auditor"];

  const currentLens = session?.active_lens || "Analytical";
  const sourceText = session?.source_text || "";

  // Auto-analyze when returning to Read mode if we already have text
  useEffect(() => {
    if (!isEditing && sourceText.trim().length > 0) {
      analyzeText(sourceText, currentLens);
    }
  }, [isEditing, currentLens]); // Re-run when lens changes

  const cycleLens = () => {
    // Hide current popover when switching lenses to avoid desync
    setActiveQuestion(null);
    const currentIdx = lenses.indexOf(currentLens);
    const nextLens = lenses[(currentIdx + 1) % lenses.length];
    onChange?.({ active_lens: nextLens });
  };

  const analyzeText = async (text: string, lens: string) => {
    setIsAnalyzing(true);
    setHighlights([]);
    setActiveQuestion(null);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_text: text, active_lens: lens })
      });
      const data = await res.json();
      if (data.highlights) {
        setHighlights(data.highlights);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper to accurately map strings to spans
  const renderReadMode = () => {
    if (isAnalyzing) return <div className="text-zinc-500 italic p-6">Analyzing with {currentLens} lens...</div>;
    if (!sourceText) return <div className="text-zinc-600 italic p-6">Text area is empty. Switch to Edit Mode.</div>;

    // We split by sentences matching our mock API logic
    const sentences = sourceText.match(/[^.!?]+[.!?]+/g) || [sourceText];

    return (
      <div 
        className="p-6 serif-font leading-relaxed text-[#c0c0c0] text-lg space-y-4"
        onMouseUp={(e) => {
          const selection = window.getSelection();
          const text = selection?.toString().trim();
          if (text && text.length > 3) {
            setSelectionRange({ text, top: e.clientY - 45, left: e.clientX });
          } else {
            setSelectionRange(null);
          }
        }}
      >
        {sentences.map((sentence: string, sIdx: number) => {
          const match = highlights.find((h) => h.text_snippet === sentence.trim());
          
          if (match) {
            return (
              <span 
                key={sIdx}
                onClick={() => setActiveQuestion({ id: match.id, text: match.question })}
                className="perspective-highlight relative group"
              >
                {sentence}
                {/* Embedded Popover Box */}
                {activeQuestion?.id === match.id && (
                  <div className="absolute left-1/2 -translateX-1/2 bottom-full mb-2 w-64 p-4 z-50 rounded-lg border border-yellow-600/50 bg-[#1a1a1a] shadow-xl text-yellow-100 text-sm font-sans normal-case leading-snug cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="font-semibold text-yellow-500 mb-1 flex items-center justify-between">
                      Provocation
                      <button onClick={(e) => { e.stopPropagation(); setActiveQuestion(null); }} className="text-zinc-500 hover:text-white material-symbols-outlined text-[14px]">close</button>
                    </div>
                    {activeQuestion?.text}
                    {/* Tooltip caret */}
                    <div className="absolute top-full left-10 w-3 h-3 border-r border-b border-yellow-600/50 bg-[#1a1a1a] rotate-45 -mt-1.5"></div>
                  </div>
                )}
              </span>
            );
          }
          return <span key={sIdx}>{sentence}</span>;
        })}

        {/* Floating Send Button */}
        {selectionRange && (
          <div 
            className="fixed z-50 transform -translate-x-1/2" 
            style={{ top: selectionRange.top, left: selectionRange.left }}
          >
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onSendToScaffolder?.(selectionRange.text);
                setSelectionRange(null);
                window.getSelection()?.removeAllRanges();
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded shadow-lg flex items-center gap-1 font-sans"
            >
              <span className="material-symbols-outlined text-[14px]">send</span>
              Send to Scaffolder
            </button>
          </div>
        )}
      </div>
    );
  };


  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Reader</h2>
        <div className="flex items-center gap-2">
          {/* Edit / Read Mode Toggle */}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              isEditing ? "bg-blue-900/40 text-blue-300 border border-blue-800/50" : "text-zinc-400 hover:bg-zinc-800"
            }`}
          >
            {isEditing ? "Save & Analyze" : "Edit Text"}
          </button>
          
          <div className="relative group">
            <button 
              onClick={cycleLens}
              className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
            >
              <span>Perspective Lens: <span className="text-white">{currentLens}</span></span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        {isEditing ? (
          <textarea 
            className="w-full h-full resize-none bg-transparent p-6 serif-font leading-relaxed text-[#c0c0c0] text-lg focus:outline-none"
            placeholder="Paste text or upload source material here to begin active reading..."
            value={sourceText}
            onChange={(e) => onChange?.({ source_text: e.target.value })}
          />
        ) : (
          renderReadMode()
        )}
      </div>
    </section>
  );
}


