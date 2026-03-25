"use client";

export default function Reader({ session, onChange }: any) {
  const lenses = ["Analytical", "The Skeptic", "The Exam-Maker", "The Business Auditor"];

  const cycleLens = () => {
    const currentIdx = lenses.indexOf(session?.active_lens || "Analytical");
    const nextLens = lenses[(currentIdx + 1) % lenses.length];
    onChange?.({ active_lens: nextLens });
  };

  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Reader</h2>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button 
              onClick={cycleLens}
              className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 px-2 py-1 rounded transition-colors"
            >
              <span>Perspective Lens: <span className="text-white">{session?.active_lens || 'Analytical'}</span></span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
        <textarea 
          className="w-full h-full resize-none bg-transparent p-6 serif-font leading-relaxed text-[#c0c0c0] text-lg focus:outline-none"
          placeholder="Paste text or upload source material here to begin active reading..."
          value={session?.source_text || ''}
          onChange={(e) => onChange?.({ source_text: e.target.value })}
        />
      </div>
    </section>
  );
}

