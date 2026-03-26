"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Reader from "@/components/Reader";
import Scaffolder from "@/components/Scaffolder";
import type { ScaffoldNode } from "@/lib/db";

const GATEKEEPER_THRESHOLD = 3;

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [nodes, setNodes] = useState<ScaffoldNode[]>([]);

  // Count nodes where both title and claim are filled
  const completedCount = nodes.filter(
    (n) => n.title?.trim() && n.student_claim?.trim()
  ).length;
  const isEditorUnlocked = completedCount >= GATEKEEPER_THRESHOLD;

  // Load existing nodes on mount
  useEffect(() => {
    setIsMounted(true);
    fetch("/api/scaffold")
      .then((r) => r.json())
      .then((data: ScaffoldNode[]) => setNodes(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Called by Reader when user selects text and clicks "Add to Scaffold"
  const handleAddToScaffold = useCallback(async (quote: string) => {
    const res = await fetch("/api/scaffold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidence_quote: quote }),
    });
    const newNode: ScaffoldNode = await res.json();
    setNodes((prev) => [...prev, newNode]);
  }, []);

  // Called by Scaffolder on field blur
  const handleUpdateNode = useCallback(
    async (id: string, patch: { title?: string; student_claim?: string }) => {
      const res = await fetch("/api/scaffold", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const updated: ScaffoldNode = await res.json();
      setNodes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    },
    []
  );

  // Called by Scaffolder delete button
  const handleDeleteNode = useCallback(async (id: string) => {
    await fetch("/api/scaffold", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNodes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  if (!isMounted) {
    return <div className="h-screen bg-[#121212]" />;
  }

  const remaining = Math.max(0, GATEKEEPER_THRESHOLD - completedCount);

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
            <Reader onAddToScaffold={handleAddToScaffold} />
          </Panel>

          {/* Grab Bar 1 */}
          <PanelResizeHandle className="w-4 group cursor-col-resize flex justify-center outline-none">
            <div className="w-[1px] h-full bg-[#2d2d2d] group-hover:bg-[#4a4a4a] group-focus:bg-rose-400/50 transition-colors duration-200"></div>
          </PanelResizeHandle>

          {/* Section 2: The Scaffolder */}
          <Panel defaultSize={25} minSize={15} maxSize={40}>
            <Scaffolder
              nodes={nodes}
              onUpdate={handleUpdateNode}
              onDelete={handleDeleteNode}
            />
          </Panel>

          {/* Grab Bar 2 */}
          <PanelResizeHandle className="w-4 group cursor-col-resize flex justify-center outline-none">
            <div className="w-[1px] h-full bg-[#2d2d2d] group-hover:bg-[#4a4a4a] group-focus:bg-rose-400/50 transition-colors duration-200"></div>
          </PanelResizeHandle>

          {/* Section 3: The Editor */}
          <Panel defaultSize={50} minSize={30}>
            <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden relative">
              <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">The Editor</h2>
                {isEditorUnlocked && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                    <span className="material-symbols-outlined text-[13px]">lock_open</span>
                    Unlocked
                  </span>
                )}
              </header>

              {/* Editor + Gatekeeper overlay wrapper */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Main Editor Area */}
                <div
                  className={`flex-1 overflow-y-auto custom-scrollbar p-8 font-serif leading-relaxed text-[#f0f0f0] text-lg editor-container outline-none transition-all duration-500 ${
                    isEditorUnlocked ? "" : "pointer-events-none select-none"
                  }`}
                  contentEditable={isEditorUnlocked}
                  suppressContentEditableWarning={true}
                >
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

                {/* GATEKEEPER OVERLAY */}
                {!isEditorUnlocked && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-md bg-[#121212]/60">
                    <div className="flex flex-col items-center gap-3 text-center px-8">
                      <span className="material-symbols-outlined text-[48px] text-zinc-500">lock</span>
                      <p className="text-sm font-semibold text-zinc-300 tracking-wide">
                        Thinking Required
                      </p>
                      <p className="text-xs text-zinc-500 leading-relaxed max-w-[220px]">
                        Create{" "}
                        <span className="text-yellow-400 font-bold">
                          {remaining} more node{remaining !== 1 ? "s" : ""}
                        </span>{" "}
                        in the Scaffolder to unlock writing.
                      </p>
                      {/* Progress dots */}
                      <div className="flex gap-2 mt-1">
                        {Array.from({ length: GATEKEEPER_THRESHOLD }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full transition-all duration-500 ${
                              i < completedCount ? "bg-emerald-500" : "bg-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Provocation Margin */}
                <div className="provocation-margin shrink-0 flex flex-col items-center py-8 gap-12 text-zinc-600 relative">
                  <div className="absolute top-0 right-0 h-full w-[40px] flex flex-col items-center">
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
