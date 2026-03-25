"use client";

import { useEffect, useState } from "react";
import Reader from "@/components/Reader";
import Scaffolder from "@/components/Scaffolder";
import Editor from "@/components/Editor";

export default function Home() {
  const [data, setData] = useState<{ sessions: any[], scaffoldNodes: any[], drafts: any[] }>({
    sessions: [],
    scaffoldNodes: [],
    drafts: []
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string>("session_1");

  useEffect(() => {
    fetch('/api/session').then(res => res.json()).then(result => {
      setData({
        sessions: result.sessions || [],
        scaffoldNodes: result.scaffoldNodes || [],
        drafts: result.drafts || []
      });
      // Ensure the active session exists, else fallback to the first available
      if (result.sessions?.length > 0 && !result.sessions.find((s: any) => s.id === activeSessionId)) {
        setActiveSessionId(result.sessions[0].id);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveToAPI = async (updates: any) => {
    const newData = { ...data, ...updates };
    setData(newData); // Optimistic UI update
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const createNewProject = () => {
    const newId = `session_${Date.now()}`;
    const newSession = {
      id: newId,
      name: `Project ${new Date().toLocaleDateString()}`,
      source_text: "",
      active_lens: "Analytical"
    };
    const newDraft = {
      id: `draft_${Date.now()}`,
      session_id: newId,
      content: ""
    };
    
    saveToAPI({
      sessions: [...data.sessions, newSession],
      drafts: [...data.drafts, newDraft]
    });
    
    setActiveSessionId(newId);
  };

  if (data.sessions.length === 0) return <div className="h-screen flex items-center justify-center bg-[#121212] text-zinc-500">Loading Database...</div>;

  const session = data.sessions.find((s: any) => s.id === activeSessionId);
  const nodes = data.scaffoldNodes.filter((n: any) => n.session_id === activeSessionId).sort((a: any, b: any) => a.order_index - b.order_index);
  const draft = data.drafts.find((d: any) => d.session_id === activeSessionId);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-[#222] bg-[#121212] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
            T
          </div>
          <h1 className="text-sm font-semibold text-zinc-200 tracking-tight">Thoughtful</h1>
          <span className="text-zinc-600 text-xs px-2 py-0.5 rounded-full border border-zinc-800 ml-2">Beta</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <button className="hover:text-white transition-colors">Workspace</button>
          <button className="hover:text-white transition-colors">Library</button>
          <button className="hover:text-white transition-colors">Settings</button>
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 ml-4 border-dashed relative">
             <div className="absolute inset-0 bg-green-500 rounded-full h-2 w-2 top-0 right-0 translate-x-3 -translate-y-1"></div>
          </div>
        </div>
      </header>

      {/* Main Layout containing Sidebar and Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Workspace Explorer */}
        <aside className="w-[200px] shrink-0 border-r border-[#222] bg-[#121212] flex flex-col z-10">
          <div className="p-4 border-b border-[#222]">
            <button 
              onClick={createNewProject} 
              className="w-full py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-white/5 text-zinc-200 rounded text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              + New Project
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            <h3 className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 py-2">Sessions</h3>
            {data.sessions.map((s: any) => (
              <button 
                key={s.id}
                onClick={() => setActiveSessionId(s.id)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  s.id === activeSessionId 
                    ? 'bg-zinc-800 text-white font-medium' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'
                }`}
              >
                <div className="truncate">{s.name || `Session ${s.id.split('_')[1] || s.id}`}</div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main 3-Column Work Area */}
        <main className="flex-1 flex overflow-hidden p-4 gap-4 bg-[#121212]">
          <div className="w-1/4 min-w-[300px] h-full">
            <Reader 
              session={session} 
              onChange={(updates: any) => {
                const newSessions = data.sessions.map((s: any) => s.id === activeSessionId ? { ...s, ...updates } : s);
                saveToAPI({ sessions: newSessions });
              }} 
              onSendToScaffolder={(text: string) => {
                const newNode = { id: Date.now().toString(), session_id: activeSessionId, title: "", evidence_quote: text, student_claim: "", order_index: nodes?.length || 0 };
                saveToAPI({ scaffoldNodes: [...data.scaffoldNodes, newNode] });
              }}
            />
          </div>
          <div className="w-1/4 min-w-[300px] h-full">
            <Scaffolder 
              nodes={nodes} 
              onAddNode={() => {
                const newNode = { id: Date.now().toString(), session_id: activeSessionId, title: "", evidence_quote: "", student_claim: "", order_index: nodes?.length || 0 };
                saveToAPI({ scaffoldNodes: [...data.scaffoldNodes, newNode] });
              }}
              onUpdateNode={(nodeId: string, updates: any) => {
                const newNodes = data.scaffoldNodes.map((n: any) => n.id === nodeId ? { ...n, ...updates } : n);
                saveToAPI({ scaffoldNodes: newNodes });
              }}
            />
          </div>
          <div className="w-2/4 min-w-[400px] h-full">
            <Editor 
              draft={draft}
              nodesCount={nodes?.length || 0}
              onChange={(newContent: string) => {
                const newDrafts = data.drafts.map((d: any) => d.session_id === activeSessionId ? { ...d, content: newContent } : d);
                saveToAPI({ drafts: newDrafts });
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
