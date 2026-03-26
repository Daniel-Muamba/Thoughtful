"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Reader from "@/components/Reader";
import Scaffolder from "@/components/Scaffolder";
import Editor from "@/components/Editor";
import Sidebar from "@/components/Sidebar";
import type { ScaffoldNode } from "@/lib/db";

const GATEKEEPER_THRESHOLD = 3;

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [nodes, setNodes] = useState<ScaffoldNode[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Count nodes where both title and claim are filled
  const completedCount = nodes.filter(
    (n) => n.title?.trim() && n.student_claim?.trim()
  ).length;
  const isEditorUnlocked = completedCount >= GATEKEEPER_THRESHOLD;

  // Load session on mount
  useEffect(() => {
    setIsMounted(true);
    fetch("/api/session")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.sessions && data.sessions.length > 0) {
          setActiveSessionId(data.sessions[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Load existing nodes when activeSessionId changes
  useEffect(() => {
    if (!activeSessionId) return;
    fetch(`/api/scaffold?sessionId=${activeSessionId}`)
      .then((r) => r.json())
      .then((data: ScaffoldNode[]) => setNodes(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [activeSessionId]);

  // Called by Reader when user selects text and clicks "Add to Scaffold"
  const handleAddToScaffold = useCallback(async (quote: string) => {
    if (!activeSessionId) return;
    const res = await fetch("/api/scaffold", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ evidence_quote: quote, session_id: activeSessionId }),
    });
    const newNode: ScaffoldNode = await res.json();
    setNodes((prev) => [...prev, newNode]);
  }, [activeSessionId]);

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
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
      />

      {/* Header */}
      <header className="h-14 border-b academic-border flex items-center justify-between px-4 shrink-0 bg-[#121212] z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-zinc-400 hover:text-white transition-colors">
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
            <Reader activeSessionId={activeSessionId} onAddToScaffold={handleAddToScaffold} />
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
            <Editor
              nodes={nodes}
              isUnlocked={isEditorUnlocked}
              completedCount={completedCount}
              gateThreshold={GATEKEEPER_THRESHOLD}
            />
          </Panel>

        </PanelGroup>
      </main>
    </div>
  );
}
