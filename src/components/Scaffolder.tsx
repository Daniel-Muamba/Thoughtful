"use client";

import React from 'react';
import type { ScaffoldNode } from '@/lib/db';

interface ScaffolderProps {
  nodes: ScaffoldNode[];
  onUpdate: (id: string, patch: { title?: string; student_claim?: string }) => void;
  onDelete: (id: string) => void;
}

const GATEKEEPER_THRESHOLD = 3;

function ClaimCard({
  node,
  index,
  onUpdate,
  onDelete,
}: {
  node: ScaffoldNode;
  index: number;
  onUpdate: ScaffolderProps['onUpdate'];
  onDelete: ScaffolderProps['onDelete'];
}) {
  const isComplete = !!(node.title?.trim() && node.student_claim?.trim());

  return (
    <div
      className={`thought-card rounded-lg p-4 flex flex-col gap-3 transition-all duration-200 ${
        isComplete ? 'border-emerald-800/40' : 'border-[#333]'
      }`}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Node {index + 1}
        </span>
        <div className="flex items-center gap-2">
          {isComplete && (
            <span className="text-emerald-500 material-symbols-outlined text-[14px]">
              check_circle
            </span>
          )}
          <button
            onClick={() => onDelete(node.id)}
            className="text-zinc-600 hover:text-rose-400 transition-colors"
            title="Delete node"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

      {/* Evidence Quote */}
      <p className="text-[13px] italic text-zinc-400 leading-snug border-l-2 border-yellow-600/50 pl-3">
        &ldquo;{node.evidence_quote}&rdquo;
      </p>

      {/* Node Title */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Node Title
        </label>
        <input
          type="text"
          defaultValue={node.title ?? ''}
          placeholder="Name this idea…"
          className="w-full bg-[#1a1a1a] border border-[#2d2d2d] focus:border-zinc-500 rounded px-3 py-1.5 text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none transition-colors"
          onBlur={(e) => onUpdate(node.id, { title: e.target.value })}
        />
      </div>

      {/* My Claim */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          My Claim
        </label>
        <textarea
          defaultValue={node.student_claim ?? ''}
          placeholder="How does this evidence connect to your argument?"
          rows={3}
          className="w-full bg-[#1a1a1a] border border-[#2d2d2d] focus:border-zinc-500 rounded px-3 py-2 text-[13px] text-zinc-200 placeholder:text-zinc-600 outline-none resize-none transition-colors leading-relaxed custom-scrollbar"
          onBlur={(e) => onUpdate(node.id, { student_claim: e.target.value })}
        />
      </div>
    </div>
  );
}

export default function Scaffolder({ nodes, onUpdate, onDelete }: ScaffolderProps) {
  const completedCount = nodes.filter(
    (n) => n.title?.trim() && n.student_claim?.trim()
  ).length;
  const remaining = Math.max(0, GATEKEEPER_THRESHOLD - completedCount);

  return (
    <section className="h-full flex flex-col bg-[#181818] rounded-lg border academic-border overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b academic-border flex items-center justify-between px-4 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
          The Scaffolder
        </h2>
        <div className="flex items-center gap-2">
          {nodes.length > 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                remaining === 0
                  ? 'bg-emerald-900/50 text-emerald-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              {completedCount}/{GATEKEEPER_THRESHOLD}
            </span>
          )}
        </div>
      </header>

      {/* Card Feed */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-4">
        {nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
            <span className="material-symbols-outlined text-[40px] text-zinc-700">
              format_list_bulleted_add
            </span>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Select text in The Reader and click{' '}
              <strong className="text-zinc-400">Add to Scaffold</strong> to start building
              your argument.
            </p>
          </div>
        ) : (
          nodes.map((node, i) => (
            <ClaimCard
              key={node.id}
              node={node}
              index={i}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      {/* Gatekeeper Status Bar */}
      {nodes.length > 0 && (
        <footer className="border-t academic-border px-4 py-3 shrink-0">
          {remaining > 0 ? (
            <p className="text-[11px] text-zinc-500 leading-snug">
              <span className="text-yellow-500 font-semibold">{remaining} more node{remaining !== 1 ? 's' : ''}</span> needed to unlock The Editor.
            </p>
          ) : (
            <p className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">lock_open</span>
              The Editor is unlocked!
            </p>
          )}
          {/* Progress bar */}
          <div className="mt-2 h-1 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                remaining === 0 ? 'bg-emerald-500' : 'bg-yellow-600'
              }`}
              style={{ width: `${Math.min(100, (completedCount / GATEKEEPER_THRESHOLD) * 100)}%` }}
            />
          </div>
        </footer>
      )}
    </section>
  );
}
