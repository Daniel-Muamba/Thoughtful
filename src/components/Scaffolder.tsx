export default function Scaffolder() {
  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Scaffolder</h2>
        <button className="text-zinc-500 hover:text-white">
          <span className="material-symbols-outlined text-[18px]">more_vert</span>
        </button>
      </header>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Thought Card 1 */}
        <div className="thought-card p-4 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">Source Link: p. 42</span>
          </div>
          <p className="text-sm italic text-zinc-300 leading-tight">&quot;Evidence: ...collaborative group work and a final exam to demonstrate their mastery of analytical tools...&quot;</p>
          <div className="pt-2 border-t border-[#333]">
            <p className="text-sm text-zinc-100 font-medium"><span className="text-zinc-500 font-normal">My Claim:</span> This suggests a shift towards experiential learning over purely theoretical reading, requiring practical application of concepts in team environments.</p>
          </div>
        </div>
        {/* Thought Card 2 */}
        <div className="thought-card p-4 rounded-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">Source Link: p. 58</span>
          </div>
          <p className="text-sm italic text-zinc-300 leading-tight">&quot;Evidence: ...modern industry trends, such as the integration of artificial intelligence...&quot;</p>
          <div className="pt-2 border-t border-[#333]">
            <p className="text-sm text-zinc-100 font-medium"><span className="text-zinc-500 font-normal">My Claim:</span> AI is not just an auxiliary tool but a core component of modern project lifecycles, demanding new skill sets.</p>
          </div>
        </div>
        {/* Add Card Button */}
        <button className="w-full py-3 border border-dashed border-zinc-700 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Thought Card
        </button>
      </div>
    </section>
  );
}
