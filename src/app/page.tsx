"use client";

import React, { useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div className="h-screen bg-[#121212]" />;
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#121212] text-[#e0e0e0] font-sans">
      {/* Header */}
      <header className="h-14 border-b academic-border flex items-center justify-between px-4 shrink-0 bg-[#121212] z-10">
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white tracking-tight">Thoughtful</span>
            <span className="text-zinc-500 text-sm">|</span>
            <span className="text-zinc-500 text-sm font-light">Research &amp; Writing Workspace</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">account_circle</span>
          </button>
          <button className="px-3 py-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-xs font-medium rounded transition-colors border border-white/5">
            Shared
          </button>
        </div>
      </header>

      {/* Main Content Grid via PanelGroup */}
      <main className="flex-1 flex overflow-hidden p-4">
        <PanelGroup autoSaveId="thoughtful-layout" direction="horizontal" className="w-full h-full">
          
          {/* Section 1: The Reader */}
          <Panel defaultSize={25} minSize={15} maxSize={40}>
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
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 font-serif leading-relaxed text-[#c0c0c0] text-lg">
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
          </Panel>

          {/* Grab Bar 1 */}
          <PanelResizeHandle className="w-4 group cursor-col-resize flex justify-center outline-none">
            <div className="w-[1px] h-full bg-[#2d2d2d] group-hover:bg-[#4a4a4a] group-focus:bg-rose-400/50 transition-colors duration-200"></div>
          </PanelResizeHandle>

          {/* Section 2: The Scaffolder */}
          <Panel defaultSize={25} minSize={15} maxSize={40}>
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
          </Panel>

          {/* Grab Bar 2 */}
          <PanelResizeHandle className="w-4 group cursor-col-resize flex justify-center outline-none">
            <div className="w-[1px] h-full bg-[#2d2d2d] group-hover:bg-[#4a4a4a] group-focus:bg-rose-400/50 transition-colors duration-200"></div>
          </PanelResizeHandle>

          {/* Section 3: The Editor */}
          <Panel defaultSize={50} minSize={30}>
            <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
              <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Editor</h2>
              </header>
              <div className="flex-1 flex overflow-hidden">
                {/* Main Editor Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 font-serif leading-relaxed text-[#f0f0f0] text-lg editor-container outline-none" contentEditable={true} suppressContentEditableWarning={true}>
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
          </Panel>

        </PanelGroup>
      </main>
    </div>
  );
}
