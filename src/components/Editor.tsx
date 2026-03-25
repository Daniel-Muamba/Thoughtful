export default function Editor() {
  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Editor</h2>
      </header>
      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 serif-font leading-relaxed text-[#f0f0f0] text-lg editor-container" contentEditable suppressContentEditableWarning>
          <p className="mb-6">The evolution of project management paradigms reflects a broader shift towards data-driven and socially responsible frameworks.</p>
          <p className="mb-6">
            As indicated by recent academic discourse, the effective integration of <span className="text-rose-400/80 underline decoration-rose-400/30">artificial intelligence</span> and the prioritization of <span className="text-rose-400/80 underline decoration-rose-400/30">global sustainability goals</span> are now foundational to modern project execution.
          </p>
          <p className="mb-6">
            This requires project leaders to not only master technical analytical tools but also to foster <span className="text-rose-400/80 underline decoration-rose-400/30">adaptive, collaborative team</span> environments that can navigate complexity.
          </p>
          <p className="mb-6">
            Furthermore, the professional development landscape is adapting, with certification paths increasingly emphasizing these contemporary competencies.
          </p>
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
              <button className="hover:text-rose-400 transition-colors" title="Missing evidence">
                <span className="material-symbols-outlined text-[20px]">error</span>
              </button>
              <button className="hover:text-rose-400 transition-colors" title="Weak transition">
                <span className="material-symbols-outlined text-[20px]">error</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Editor Footer */}
      <footer className="h-8 border-t academic-border px-4 flex items-center justify-between shrink-0 bg-[#141414]">
        <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-medium">
          <span>Word Count: 98</span>
          <span>Last Saved: Just now.</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500/50"></div>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Cloud Sync Active</span>
        </div>
      </footer>
    </section>
  );
}
