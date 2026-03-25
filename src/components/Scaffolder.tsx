"use client";

export default function Scaffolder({ nodes = [], onAddNode, onUpdateNode }: any) {
  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Scaffolder</h2>
        <button className="text-zinc-500 hover:text-white">
          <span className="material-symbols-outlined text-[18px]">more_vert</span>
        </button>
      </header>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {nodes.map((node: any, idx: number) => (
          <div key={node.id} className="thought-card p-4 rounded-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-tighter">Node {idx + 1}</span>
            </div>
            <input
              type="text"
              placeholder="Thought Title..."
              className="w-full text-sm font-semibold text-white bg-transparent outline-none mb-1 mt-2"
              value={node.title || ''}
              onChange={(e) => onUpdateNode(node.id, { title: e.target.value })}
            />
            <textarea
              className="w-full text-sm italic text-zinc-300 leading-tight bg-transparent resize-none focus:outline-none"
              placeholder="Paste evidence..."
              value={node.evidence_quote || ''}
              onChange={(e) => onUpdateNode(node.id, { evidence_quote: e.target.value })}
              rows={2}
            />
            <div className="pt-2 border-t border-[#333]">
              <span className="text-zinc-500 text-sm block mb-1">My Claim:</span>
              <textarea
                className="w-full text-sm text-zinc-100 font-medium bg-transparent resize-none focus:outline-none"
                placeholder="Write a claim connecting evidence..."
                value={node.student_claim || ''}
                onChange={(e) => onUpdateNode(node.id, { student_claim: e.target.value })}
                rows={2}
              />
            </div>
          </div>
        ))}
        
        {/* Add Card Button */}
        <button 
          onClick={onAddNode}
          className="w-full py-3 mt-4 border border-dashed border-zinc-700 rounded-md text-xs text-zinc-500 hover:text-zinc-300 hover:border-zinc-500 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Thought Card
        </button>
      </div>
    </section>
  );
}

