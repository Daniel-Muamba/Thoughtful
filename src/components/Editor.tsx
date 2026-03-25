"use client";

import { useState, useEffect, useRef } from "react";

export default function Editor({ draft, nodesCount = 0, onChange }: any) {
  const [htmlContent, setHtmlContent] = useState(draft?.content || '');
  const [provocation, setProvocation] = useState<{ textSnippet: string, question: string, nodeId: string } | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [activeHighlightTop, setActiveHighlightTop] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const wordCount = htmlContent.replace(/<[^>]+>/g, '').trim() ? htmlContent.replace(/<[^>]+>/g, '').trim().split(/\s+/).length : 0;
  const isLocked = nodesCount < 3;

  // Handle typing inside contentEditable
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const rawText = e.currentTarget.innerText;
    setHtmlContent(rawText);
    onChange?.(rawText);

    // Hide provocation highlights when they resume typing to prevent mess
    if (provocation) {
      setProvocation(null);
      setIsPopoverOpen(false);
    }

    // Debounced AI Coach fetch
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      analyzeDraft(rawText);
    }, 3000);
  };

  const analyzeDraft = async (text: string) => {
    if (isLocked || !text.trim()) return;
    try {
      // In a real app we'd fetch the nodes from state, but for this prototype 
      // the coach API just needs to know they exist. We'll simulate fetching nodes.
      // (Actually we can just pass nodesCount since the backend mocks the random title anyway)
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, nodes: Array.from({length: nodesCount}).map((_, i) => ({ id: i, title: `Node ${i+1}` })) })
      });
      const data = await res.json();
      if (data.provocation) {
        setProvocation(data.provocation);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Determine what HTML to display
  let displayHtml = htmlContent;
  if (provocation && displayHtml.includes(provocation.textSnippet)) {
    // Inject the interactive span
    displayHtml = displayHtml.replace(
      provocation.textSnippet, 
      `<span class="coach-warning bg-rose-500/20 text-rose-100 border-b border-rose-500 cursor-pointer transition-colors hover:bg-rose-500/40">${provocation.textSnippet}</span>`
    );
  }

  // Event Delegation for injected HTML elements
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('coach-warning')) {
      // Get exact position of the span relative to the container to position the popover
      setActiveHighlightTop(target.offsetTop);
      setIsPopoverOpen(true);
    } else {
      setIsPopoverOpen(false);
    }
  };

  // Initial Sync from parent only once if empty
  useEffect(() => {
    if (!htmlContent && draft?.content) {
      setHtmlContent(draft.content);
    }
  }, [draft?.content]);

  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Editor</h2>
      </header>
      <div className="flex-1 flex overflow-hidden relative">
        {/* Gatekeeper Overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#121212]/80 backdrop-blur-[2px] z-20">
            <span className="material-symbols-outlined text-4xl text-rose-500 mb-4 opacity-80">lock</span>
            <h3 className="text-xl font-semibold text-white mb-2">Editor Locked</h3>
            <p className="text-zinc-400">Create {3 - nodesCount} more thought card{3 - nodesCount === 1 ? '' : 's'} in the Scaffolder to unlock.</p>
          </div>
        )}
        
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0 relative">
          <div 
            ref={contentRef}
            contentEditable={!isLocked}
            suppressContentEditableWarning
            className={`w-full min-h-full bg-transparent p-8 serif-font leading-relaxed text-lg outline-none whitespace-pre-wrap ${isLocked ? 'text-zinc-600' : 'text-[#f0f0f0]'}`}
            onInput={handleInput}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
          
          {/* AI Coach Overlay Popover */}
          {isPopoverOpen && provocation && (
            <div 
              className="absolute right-8 w-72 p-4 z-50 rounded-lg border border-rose-600/50 bg-[#1a1313] shadow-2xl text-rose-100 text-sm font-sans normal-case leading-snug cursor-default"
              style={{ top: Math.max(0, activeHighlightTop - 60) }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-semibold text-rose-400 mb-2 flex items-center justify-between">
                Lurking AI Coach
                <button onClick={() => setIsPopoverOpen(false)} className="text-zinc-500 hover:text-white material-symbols-outlined text-[14px]">close</button>
              </div>
              <p className="mb-3">{provocation.question}</p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setIsPopoverOpen(false)}
                  className="px-3 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 rounded text-xs transition-colors"
                >
                  Ignore
                </button>
                <button 
                  onClick={() => {
                    setProvocation(null);
                    setIsPopoverOpen(false);
                    // Standard UX flow would be pushing the cursor back to text, but user can just click back
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs transition-colors"
                >
                  I'll Revise It
                </button>
              </div>
              {/* Tooltip caret pointing left */}
              <div className="absolute top-8 -left-1.5 w-3 h-3 border-l border-b border-rose-600/50 bg-[#1a1313] rotate-45"></div>
            </div>
          )}
        </div>
        
        {/* Provocation Margin */}
        <div className="provocation-margin shrink-0 flex flex-col items-center py-8 gap-12 text-zinc-600 relative w-[40px] bg-[#141414] border-l border-[#222]">
          {/* Active AI Status dot */}
          <div className="mt-2" title="Lurking Coach is actively watching">
            <div className={`h-2 w-2 rounded-full ${provocation ? 'bg-rose-500 animate-pulse' : 'bg-zinc-700'}`}></div>
          </div>
        </div>
      </div>
      {/* Editor Footer */}
      <footer className="h-8 border-t academic-border px-4 flex items-center justify-between shrink-0 bg-[#141414]">
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-medium">
          <span>Word Count: {wordCount}</span>
          <span>Last Saved: Auto-sync</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500/50"></div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Cloud Sync Active</span>
        </div>
      </footer>
    </section>
  );
}
