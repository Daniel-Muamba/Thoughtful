"use client";

import React, { useEffect, useState } from "react";
import type { Session } from "@/lib/db";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
}

export default function Sidebar({ isOpen, onClose, activeSessionId, onSelectSession }: SidebarProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch('/api/session')
        .then(res => res.json())
        .then(data => {
          if (data && data.sessions) {
            setSessions(data.sessions);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleCreateSession = async () => {
    const newSession: Session = {
      id: "session_" + Date.now(),
      title: "New Research Session",
      source_text: "",
      active_lens: "None",
      created_at: new Date().toISOString()
    };

    const updatedSessions = [newSession, ...sessions];
    
    await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessions: updatedSessions })
    });
    
    setSessions(updatedSessions);
    onSelectSession(newSession.id);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#1a1a1a] border-r border-[#333] z-50 transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-[#333]">
          <h2 className="text-sm font-semibold text-white tracking-widest uppercase">Sessions</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-4 border-b border-[#333]">
          <button 
            onClick={handleCreateSession}
            className="w-full flex items-center justify-center gap-2 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-400 border border-emerald-800/50 rounded py-2 text-sm font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {loading ? (
            <p className="text-center text-zinc-500 text-sm mt-4 tracking-wider">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm mt-4 tracking-wider">No sessions found.</p>
          ) : (
            <ul className="space-y-1">
              {sessions.map(session => (
                <li key={session.id}>
                  <button 
                    onClick={() => { onSelectSession(session.id); onClose(); }}
                    className={`w-full text-left px-3 py-2.5 rounded transition-colors ${activeSessionId === session.id ? 'bg-[#2a2a2a] text-white border border-[#444]' : 'text-zinc-400 hover:bg-[#222] hover:text-zinc-200 border border-transparent'}`}
                  >
                    <div className="font-medium text-sm line-clamp-1">{session.title}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {new Date(session.created_at).toLocaleDateString()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
