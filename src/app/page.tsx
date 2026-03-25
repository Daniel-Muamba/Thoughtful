import Reader from '@/components/Reader';
import Scaffolder from '@/components/Scaffolder';
import Editor from '@/components/Editor';

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
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

      {/* Main Content Grid (25/25/50) */}
      <main className="flex-1 flex overflow-hidden p-4 gap-4 bg-[#121212]">
        <div className="w-1/4 min-w-[300px] h-full">
          <Reader />
        </div>
        <div className="w-1/4 min-w-[300px] h-full">
          <Scaffolder />
        </div>
        <div className="w-2/4 min-w-[400px] h-full">
          <Editor />
        </div>
      </main>
    </div>
  );
}
