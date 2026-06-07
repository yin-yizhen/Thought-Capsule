import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';



function App() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [theme, setTheme] = useState<'pastel' | 'macos-dark' | 'ios-acrylic'>('pastel');
  const [sendKey, setSendKey] = useState<'Enter' | 'Shift+Enter'>('Shift+Enter');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load initial config
    window.electronAPI?.getConfig?.().then((config: any) => {
      if (config.theme) setTheme(config.theme);
      if (config.sendKey) setSendKey(config.sendKey);
    });
    
    // Listen for theme changes
    const cleanupTheme = window.electronAPI?.onThemeChange?.((newTheme) => {
      setTheme(newTheme);
    });
    
    return () => {
      cleanupTheme?.();
    };
  }, []);

  useEffect(() => {
    const cleanup = window.electronAPI?.onWindowShow(() => {
      setText('');
      setStatus('idle');
      
      // Fetch latest config in case it was changed
      window.electronAPI?.getConfig?.().then((config: any) => {
        if (config.sendKey) setSendKey(config.sendKey);
      });

      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
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
    } else if (e.key === 'Enter') {
      if (sendKey === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      } else if (sendKey === 'Shift+Enter' && e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
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



  const renderBackground = () => {
    if (theme === 'pastel') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
           {/* Glowing Color Blobs (Opaque) */}
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#fbcfe8] rounded-full filter blur-[70px] z-0" />
           <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[70%] bg-[#bfdbfe] rounded-full filter blur-[70px] z-0" />
           <div className="absolute bottom-[-20%] left-[10%] w-[70%] h-[70%] bg-[#e9d5ff] rounded-full filter blur-[70px] z-0" />
           {/* White Wash to soften the colors and make it look like frosted plastic */}
           <div className="absolute inset-0 bg-white/40 z-10" />
        </div>
      );
    } else if (theme === 'macos-dark') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[32px]">
          <div className="absolute inset-0 bg-[#1e1e1e]/90 backdrop-blur-2xl z-0" />
          <div className="absolute inset-0 rounded-[32px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] z-10 pointer-events-none" />
        </div>
      );
    } else if (theme === 'ios-acrylic') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 rounded-[32px]">
          <div className="absolute inset-0 bg-[#f5f5f7]/60 backdrop-blur-3xl z-0" />
          <div className="absolute inset-0 bg-white/20 z-0 mix-blend-overlay" />
        </div>
      );
    }
  };

  const getContainerClasses = () => {
    const base = "w-full max-w-[560px] min-h-[64px] h-auto overflow-hidden flex flex-row items-end transition-all duration-300 relative";
    if (theme === 'pastel') {
      return `${base} shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),_0_15px_30px_-5px_rgba(0,0,0,0.15)] border border-white/80 rounded-[32px] bg-[#f8f9fa]`;
    } else if (theme === 'macos-dark') {
      return `${base} shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-black/40 rounded-[32px] bg-transparent`;
    } else if (theme === 'ios-acrylic') {
      return `${base} shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-white/50 rounded-[32px] bg-transparent`;
    }
    return base;
  };

  const getInputClasses = () => {
    const base = "flex-1 bg-transparent border-none outline-none text-[17px] font-medium pl-3 resize-none overflow-y-auto py-2 leading-[24px]";
    if (theme === 'macos-dark') {
      return `${base} text-gray-100 placeholder:text-gray-500`;
    }
    return `${base} text-stone-800 placeholder:text-stone-400`;
  };

  const getButtonClasses = () => {
    const base = "w-10 h-10 shrink-0 flex items-center justify-center rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm disabled:opacity-30 disabled:hover:scale-100";
    if (theme === 'pastel') {
      return `${base} bg-black/20 text-white hover:bg-black/30`;
    } else if (theme === 'macos-dark') {
      return `${base} bg-white/10 text-white hover:bg-white/20`;
    } else if (theme === 'ios-acrylic') {
      return `${base} bg-black/5 text-black/60 hover:bg-black/10`;
    }
    return base;
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center p-4 bg-transparent"
    >
      <div 
        className={getContainerClasses()}
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        {renderBackground()}
        
        {/* Content Area (z-20 to sit above backgrounds) */}
        <div className="w-full relative z-20 flex flex-row items-end px-3 gap-3 py-3">
          
          {/* Input Area */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              e.target.style.height = '40px';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 88)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="随时记录灵感..."
            className={getInputClasses()}
            rows={1}
            style={{ WebkitAppRegion: 'no-drag', minHeight: '40px', maxHeight: '88px', height: '40px' } as any}
            disabled={status !== 'idle'}
            autoFocus
          />

          {/* Right Action (Send Button) */}
          <button 
            onClick={handleSubmit}
            disabled={status !== 'idle' || !text.trim()}
            className={getButtonClasses()}
            style={{ WebkitAppRegion: 'no-drag' } as any}
          >
            <Send className="w-[18px] h-[18px] -ml-0.5" />
          </button>
        </div>
        {/* Discard Confirmation Overlay */}
        {showDiscardConfirm && (
          <div className={`absolute inset-0 ${theme === 'macos-dark' ? 'bg-[#1e1e1e]/90 text-white' : 'bg-[#fcfcfc]/90 text-stone-800'} backdrop-blur-md flex items-center justify-center rounded-[32px] z-50`} style={{ WebkitAppRegion: 'no-drag' } as any}>
            <div className="flex gap-3">
                <button onClick={() => { window.electronAPI?.hideWindow(); setText(''); setShowDiscardConfirm(false); }} className={`px-5 py-2.5 rounded-full ${theme === 'macos-dark' ? 'bg-white/10 text-white hover:bg-white/20 border border-white/10' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'} font-medium transition-colors shadow-sm text-sm`}>
                  确定退出
                </button>
                <button
                  onClick={() => {
                    setShowDiscardConfirm(false);
                    setTimeout(() => textareaRef.current?.focus(), 10);
                  }}
                  className={`px-5 py-2.5 rounded-full ${theme === 'macos-dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-stone-900 text-white hover:bg-stone-800'} font-medium transition-colors shadow-sm text-sm`}
                >
                  继续编辑
                </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
