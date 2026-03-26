"use client";

import React, { useState, useRef } from 'react';

interface SourceUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (text: string) => void;
}

export default function SourceUpload({ isOpen, onClose, onImport }: SourceUploadProps) {
  const [tab, setTab] = useState<'paste' | 'pdf'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportText = () => {
    if (!pastedText.trim()) {
      setError("Please paste some text first.");
      return;
    }
    setError(null);
    onImport(pastedText);
    setPastedText(''); // reset
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError("Please select a valid PDF file.");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to extract text from PDF.");
      }

      onImport(data.text);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm p-4">
      <div className="w-[600px] bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl flex flex-col overflow-hidden font-sans">
        
        {/* Header */}
        <header className="px-6 py-4 flex items-center justify-between border-b border-[#2d2d2d] bg-[#141414]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-zinc-500">add_circle</span>
            Add Source Material
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Tabs */}
        <div className="flex px-6 border-b border-[#2d2d2d] bg-[#141414]">
          <button
            onClick={() => setTab('paste')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
              tab === 'paste' ? 'border-sky-500 text-sky-400' : 'border-transparent text-zinc-500 hover:text-zinc-400'
            }`}
          >
            Manual Paste
          </button>
          <button
            onClick={() => setTab('pdf')}
            className={`py-3 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 ${
              tab === 'pdf' ? 'border-sky-500 text-sky-400' : 'border-transparent text-zinc-500 hover:text-zinc-400'
            }`}
          >
            Upload PDF
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-rose-900/20 border border-rose-800/50 rounded-lg px-4 py-3 flex items-start gap-3">
              <span className="material-symbols-outlined text-[18px] text-rose-500">error</span>
              <p className="text-sm text-rose-300 leading-snug">{error}</p>
            </div>
          )}

          {tab === 'paste' ? (
            <div className="flex flex-col gap-4">
              <textarea
                className="w-full h-[240px] bg-[#0f0f0f] border border-[#333] rounded-lg p-4 font-serif text-[15px] text-zinc-300 leading-relaxed outline-none focus:border-sky-500/50 custom-scrollbar placeholder:text-zinc-600 transition-colors"
                placeholder="Paste your source text here (e.g., from an article, textbook, or website)…"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportText}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-sky-600 hover:bg-sky-500 text-white transition-colors"
                >
                  Import Text
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                className="w-full h-[240px] bg-[#0f0f0f] border-2 border-dashed border-[#333] hover:border-sky-900 focus-within:border-sky-500/50 rounded-lg flex flex-col items-center justify-center gap-4 transition-colors relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  title="Upload PDF"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <>
                    <span className="material-symbols-outlined text-[48px] animate-spin text-sky-500">progress_activity</span>
                    <p className="text-sm font-semibold text-zinc-400 animate-pulse">Extracting text from PDF…</p>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 bg-[#1a1a1a] border border-[#2d2d2d] rounded-full flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-[32px] text-zinc-400">upload_file</span>
                    </div>
                    <div className="text-center">
                      <p className="text-[15px] font-semibold text-zinc-300">Click to select PDF</p>
                      <p className="text-[13px] text-zinc-500 mt-1">or drag and drop here</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  disabled={isUploading}
                  className="px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wide text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
