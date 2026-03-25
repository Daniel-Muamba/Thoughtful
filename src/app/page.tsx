"use client";

import { useEffect, useState } from 'react';
import Reader from '@/components/Reader';
import Scaffolder from '@/components/Scaffolder';
import Editor from '@/components/Editor';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const sessionId = "default-session-1";

  // Fetch initial data
  useEffect(() => {
    fetch('/api/session')
      .then((res) => res.json())
      .then((dbData) => {
        // If empty DB, initialize defaults
        if (dbData.sessions?.length === 0) {
          const initData = {
            sessions: [{ id: sessionId, title: "New Session", source_text: "Paste your reading material here...", active_lens: "Analytical", created_at: new Date().toISOString() }],
            scaffoldNodes: [],
            provocations: [],
            drafts: [{ session_id: sessionId, content: "Start writing your draft...", last_trigger_word_count: 0 }]
          };
          fetch('/api/session', { method: 'POST', body: JSON.stringify(initData) });
          setData(initData);
        } else {
          setData(dbData);
        }
      });
  }, []);

  const saveToAPI = (updatedFields: any) => {
    const newData = { ...data, ...updatedFields };
    setData(newData); // Optimistic UI
    fetch('/api/session', { method: 'POST', body: JSON.stringify(newData) });
  };

  if (!data) return <div className="flex h-screen items-center justify-center bg-[#121212] text-white">Loading Workspace...</div>;

  const session = data.sessions.find((s: any) => s.id === sessionId);
  const nodes = data.scaffoldNodes.filter((n: any) => n.session_id === sessionId);
  const draft = data.drafts.find((d: any) => d.session_id === sessionId);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
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
            Cloud Sync Active
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-4 gap-4 bg-[#121212]">
        <div className="w-1/4 min-w-[300px] h-full">
          <Reader 
            session={session} 
            onChange={(updates: any) => {
              const newSessions = data.sessions.map((s: any) => s.id === sessionId ? { ...s, ...updates } : s);
              saveToAPI({ sessions: newSessions });
            }} 
          />
        </div>
        <div className="w-1/4 min-w-[300px] h-full">
          <Scaffolder 
            nodes={nodes} 
            onAddNode={() => {
              const newNode = { id: Date.now().toString(), session_id: sessionId, evidence_quote: "", student_claim: "", order_index: nodes.length };
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
            onChange={(newContent: string) => {
              const newDrafts = data.drafts.map((d: any) => d.session_id === sessionId ? { ...d, content: newContent } : d);
              saveToAPI({ drafts: newDrafts });
            }}
          />
        </div>
      </main>
    </div>
  );
}

