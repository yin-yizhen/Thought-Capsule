import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';



function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cleanup = window.electronAPI?.onWindowShow(() => {
      setText('');
      setStatus('idle');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    });
    
    inputRef.current?.focus();
    return cleanup;
  }, []);

  useEffect(() => {
    window.electronAPI?.setCanHide?.(!text.trim() && !showDiscardConfirm);
  }, [text, showDiscardConfirm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      if (showDiscardConfirm) {
        setShowDiscardConfirm(false);
        setTimeout(() => inputRef.current?.focus(), 10);
      } else if (text.trim()) {
        setShowDiscardConfirm(true);
      } else {
        window.electronAPI?.hideWindow();
      }
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };



  const handleSubmit = () => {
    if (!text.trim()) return;
    
    // Fire and forget, AI analysis runs in background
    window.electronAPI?.analyzeInput(text).catch(err => {
      console.error("Background analysis failed:", err);
    });
    
    // Close immediately
    window.electronAPI?.hideWindow();
    setText('');
    setStatus('idle');
  };



  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-transparent">
      <div 
        className="w-full max-w-[560px] h-[64px] shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),_0_15px_30px_-5px_rgba(0,0,0,0.15)] border border-white/80 rounded-full overflow-hidden flex flex-row items-center transition-all duration-300 relative bg-[#f8f9fa]"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        {/* Solid Pastel Mesh Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           {/* Glowing Color Blobs (Opaque) */}
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#fbcfe8] rounded-full filter blur-[70px] z-0" />
           <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[70%] bg-[#bfdbfe] rounded-full filter blur-[70px] z-0" />
           <div className="absolute bottom-[-20%] left-[10%] w-[70%] h-[70%] bg-[#e9d5ff] rounded-full filter blur-[70px] z-0" />
           {/* White Wash to soften the colors and make it look like frosted plastic */}
           <div className="absolute inset-0 bg-white/40 z-10" />
        </div>
        
        {/* Content Area (z-20 to sit above backgrounds) */}
        <div className="w-full h-full relative z-20 flex flex-row items-center px-3 gap-3">
          
          {/* Input Area */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="随时记录灵感..."
            className="flex-1 h-full bg-transparent border-none outline-none text-stone-800 text-[17px] font-medium placeholder:text-stone-400 pl-3"
            style={{ WebkitAppRegion: 'no-drag' } as any}
            disabled={status !== 'idle'}
            autoFocus
          />

          {/* Right Action (Send Button) */}
          <button 
            onClick={handleSubmit}
            disabled={status !== 'idle' || !text.trim()}
            className="w-10 h-10 shrink-0 flex items-center justify-center bg-black/20 text-white rounded-full hover:bg-black/30 hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-30 disabled:hover:scale-100"
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <Send className="w-[18px] h-[18px] -ml-0.5" />
          </button>
        </div>
        {/* Discard Confirmation Overlay */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 bg-[#fcfcfc]/90 backdrop-blur-md flex items-center justify-center rounded-full z-50" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <div className="flex flex-col items-center gap-5">
              <span className="text-stone-800 font-medium">内容还没保存，确认要丢弃吗？</span>
              <div className="flex gap-3">
                <button onClick={() => { window.electronAPI?.hideWindow(); setText(''); setShowDiscardConfirm(false); }} className="px-5 py-2.5 rounded-full bg-white border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors shadow-sm text-sm">
                  确定退出
                </button>
                <button
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    setTimeout(() => inputRef.current?.focus(), 10);
                  }}
                  className="px-5 py-2.5 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm text-sm"
                >
                  继续编辑
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
