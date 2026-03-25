export default function Reader() {
  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Reader</h2>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 px-2 py-1 rounded transition-colors">
              <span>Perspective Lens: <span className="text-white">Analytical</span></span>
              <span className="material-symbols-outlined text-xs">expand_more</span>
            </button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 serif-font leading-relaxed text-[#c0c0c0] text-lg">
        <p className="mb-6">The foundational principles of effective project management are rooted in comprehensive planning and strategic resource allocation.</p>
        <p className="mb-6">
          <span className="perspective-highlight">The integration of artificial intelligence has revolutionized data-driven decision-making, enhancing predictive capabilities and risk mitigation strategies.</span>
        </p>
        <p className="mb-6">
          Collaborative platforms and agile methodologies continue to reshape team dynamics, necessitating adaptive leadership models that prioritize iterative progress.
        </p>
        <p className="mb-6">
          Furthermore, the emphasis on <span className="perspective-highlight">global sustainability goals</span> in modern project frameworks requires a holistic approach, balancing economic feasibility with environmental stewardship.
        </p>
        <p className="mb-6">
          Advanced risk management involves probabilistic modeling and <span className="perspective-highlight">continuous monitoring of external factors.</span>
        </p>
        <p className="mb-6">
          Ethical considerations in data usage and stakeholder engagement are increasingly critical.
        </p>
        <p className="mb-6">
          <span className="perspective-highlight">Professional certification paths</span> often validate mastery in these evolving domains.
        </p>
      </div>
    </section>
  );
}
