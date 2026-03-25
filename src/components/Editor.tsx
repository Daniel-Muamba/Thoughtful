"use client";

export default function Editor({ draft, nodesCount = 0, onChange }: any) {
  const content = draft?.content || '';
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isLocked = nodesCount < 3;

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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
          <textarea 
            className={`w-full h-full resize-none bg-transparent p-8 serif-font leading-relaxed text-lg editor-container focus:outline-none ${isLocked ? 'text-zinc-600' : 'text-[#f0f0f0]'}`}
            placeholder="Start writing..."
            value={content}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={isLocked}
          />
        </div>
        {/* Provocation Margin */}
        <div className="provocation-margin shrink-0 flex flex-col items-center py-8 gap-12 text-zinc-600 relative">
          <div className="absolute top-0 right-0 h-full w-[40px] flex flex-col items-center">
            {/* Annotation markers aligned with marked text */}
            <div className="h-8 w-px bg-zinc-800 absolute top-4 right-[20px]"></div>
            <span className="text-[10px] absolute top-4 -right-1 rotate-90 whitespace-nowrap opacity-40">80px</span>
            <div className="mt-40 space-y-36 flex flex-col items-center">
              <button className="hover:text-rose-400 transition-colors" title="Clarify terminology">
                <span className="material-symbols-outlined text-[20px]">error</span>
              </button>
            </div>
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
