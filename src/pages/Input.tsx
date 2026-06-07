import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';



function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const cleanup = window.electronAPI?.onWindowShow(() => {
      setText('');
      setStatus('idle');
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 10);
    });
    
    textareaRef.current?.focus();
    return cleanup;
  }, []);

  useEffect(() => {
    window.electronAPI?.setCanHide?.(!text.trim() && !showDiscardConfirm);
  }, [text, showDiscardConfirm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      if (showDiscardConfirm) {
        setShowDiscardConfirm(false);
        setTimeout(() => textareaRef.current?.focus(), 10);
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
        className="w-full h-full bg-white/70 backdrop-blur-2xl shadow-[0_8px_16px_-4px_rgba(0,0,0,0.15)] border border-white/50 rounded-[32px] overflow-hidden flex flex-col transition-all duration-300 relative"
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        
        {/* Input Area */}
        <div className="p-6 pb-2 relative flex-1">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder=""
            className="w-full h-full bg-transparent border-none outline-none resize-none text-stone-800 text-[17px] leading-relaxed"
            style={{ WebkitAppRegion: 'no-drag' } as any}
            disabled={status !== 'idle'}
            autoFocus
          />

        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ WebkitAppRegion: 'no-drag' } as any}>
          {/* Left Actions */}
          <div className="flex items-center gap-3">
          </div>

          {/* Right Action */}
          <button 
            onClick={handleSubmit}
            disabled={status !== 'idle' || !text.trim()}
            className="w-10 h-10 flex items-center justify-center bg-stone-900 text-white rounded-full hover:bg-stone-800 hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-30 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        {/* Discard Confirmation Overlay */}
        {showDiscardConfirm && (
          <div className="absolute inset-0 bg-[#fcfcfc]/90 backdrop-blur-md flex items-center justify-center rounded-[32px] z-50" style={{ WebkitAppRegion: 'no-drag' } as any}>
            <div className="flex flex-col items-center gap-5">
              <span className="text-stone-800 font-medium">内容还没保存，确认要丢弃吗？</span>
              <div className="flex gap-3">
                <button onClick={() => { window.electronAPI?.hideWindow(); setText(''); setShowDiscardConfirm(false); }} className="px-5 py-2.5 rounded-full bg-white border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors shadow-sm text-sm">
                  确定退出
                </button>
                <button
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    setTimeout(() => textareaRef.current?.focus(), 10);
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
