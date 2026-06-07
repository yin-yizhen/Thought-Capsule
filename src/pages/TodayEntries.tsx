import { useEffect, useState } from 'react';
import { History, X } from 'lucide-react';

export default function TodayEntries() {
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    window.electronAPI?.getTodayEntries?.().then(setEntries);
  }, []);

  return (
    <div className="w-full h-screen bg-[#fcfcfc] text-stone-800 flex flex-col font-sans">
      {/* Header */}
      <div 
        className="bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-stone-400" />
          <h1 className="text-lg font-medium text-stone-800">今日记录</h1>
          {entries.length > 0 && (
            <span className="ml-2 bg-stone-100 text-stone-500 text-sm px-2 py-0.5 rounded-full font-semibold">
              {entries.length}
            </span>
          )}
        </div>
        <button 
          onClick={() => window.electronAPI?.hideWindow()}
          className="text-stone-400 hover:text-stone-800 hover:bg-stone-100 p-1 rounded-full transition-colors"
          style={{ WebkitAppRegion: 'no-drag' } as any}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4">
          {entries.length === 0 ? (
            <div className="text-center py-20 text-stone-400 text-[15px]">
              今天还没有记录任何内容哦
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white p-5 rounded-[24px] border border-stone-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  {entry.status === 'analyzed' && entry.aiResult && (
                    <span className="bg-stone-50 px-2.5 py-1 rounded-md text-stone-500 tracking-wide uppercase">
                      {entry.aiResult.type}
                    </span>
                  )}
                  {entry.status === 'pending' && (
                    <span className="bg-stone-100 text-stone-600 px-2.5 py-1 rounded-md tracking-wide uppercase animate-pulse">
                      分析中...
                    </span>
                  )}
                </div>
                <p className="text-stone-800 text-[15px] whitespace-pre-wrap leading-relaxed">{entry.text}</p>
                {entry.status === 'analyzed' && entry.aiResult?.reply && entry.aiResult.type !== 'normal' && (
                  <p className="text-stone-500 text-[14px] mt-1 border-l-2 border-stone-200 pl-3">
                    {entry.aiResult.reply}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
