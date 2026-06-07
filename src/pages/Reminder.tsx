import { useEffect, useState } from 'react';
import { CheckCircle, Clock, Sparkles, FileText, ChevronRight } from 'lucide-react';

export default function Reminder() {
  const [mode, setMode] = useState<'none' | 'morning' | 'reminder' | 'review'>('none');
  const [tasks, setTasks] = useState<any[]>([]);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [entryCount, setEntryCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<any>(null);
  const [isReviewDone, setIsReviewDone] = useState(false);

  useEffect(() => {
    const cleanupReminder = window.electronAPI?.onReminderShow?.((task: any) => {
      setMode('reminder');
      setCurrentTask(task);
    });

    const cleanupMorning = window.electronAPI?.onMorningShow?.((morningTasks: any[]) => {
      setMode('morning');
      setTasks(morningTasks);
      setSelections({});
    });

    const cleanupReview = window.electronAPI?.onReviewShow?.(async () => {
      setMode('review');
      setDraft(null);
      const done = await window.electronAPI?.checkReviewStatus?.();
      setIsReviewDone(done || false);
      if (!done) {
        window.electronAPI?.getTodayEntryCount?.().then((count: number) => {
          setEntryCount(count);
        });
      }
    });

    return () => {
      if (cleanupReminder) cleanupReminder();
      if (cleanupMorning) cleanupMorning();
      if (cleanupReview) cleanupReview();
    };
  }, []);

  const handleReminderAction = (action: string) => {
    if (currentTask) {
      window.electronAPI?.handleReminderAction(currentTask.id, action);
    }
  };

  const handleMorningSubmit = () => {
    const actions = Object.entries(selections).map(([taskId, action]) => ({ taskId, action }));
    window.electronAPI?.handleMorningActions?.(actions);
  };

  const handleReviewGenerate = async () => {
    setLoading(true);
    const config = await window.electronAPI?.getConfig();
    const res = await window.electronAPI?.generateReviewDraft();
    if (res?.success) {
      if (config?.previewReview !== false) {
        setDraft(res.draft);
        setLoading(false);
      } else {
        await window.electronAPI?.saveReview(res.draft);
        setLoading(false);
        window.electronAPI?.hideWindow();
      }
    } else {
      alert('生成失败: ' + res?.error);
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    await window.electronAPI?.saveReview(draft);
    setLoading(false);
    window.electronAPI?.hideWindow();
  };

  if (mode === 'none') return null;

  return (
    <div className="w-full h-full flex flex-col justify-end p-10 bg-transparent font-sans">
      <div 
        className={`w-full bg-[#fcfcfc] shadow-2xl border border-stone-100/50 rounded-[32px] p-6 flex flex-col gap-5 overflow-y-auto ${mode === 'morning' || draft ? 'max-h-[600px]' : 'max-h-[400px]'}`}
        style={{ WebkitAppRegion: 'drag' } as any}
      >
        
        {/* === Mode: Reminder === */}
        {mode === 'reminder' && currentTask && (
          <>
            <div className="flex items-center space-x-2 text-stone-800 font-medium mb-1">
              <Clock className="w-5 h-5 text-stone-400" />
              <span className="text-lg">提醒</span>
            </div>
            
            <p className="text-stone-700 text-[15px] leading-relaxed break-words bg-stone-50/50 p-4 rounded-2xl mb-1" style={{ WebkitAppRegion: 'no-drag' } as any}>
              {currentTask.originalText}
            </p>

            <div className="flex flex-col gap-2 mt-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
              <button
                onClick={() => handleReminderAction('done')}
                className="w-full py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-[15px] outline-none focus:outline-none"
              >
                <CheckCircle className="w-4 h-4" /> 完成
              </button>
              <div className="flex gap-2">
                {currentTask.type === 'TASK' ? (
                  <button
                    onClick={() => handleReminderAction('cancel')}
                    className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors text-sm outline-none focus:outline-none"
                  >
                    不做了
                  </button>
                ) : (
                  <button
                    onClick={() => handleReminderAction('later')}
                    className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors text-sm outline-none focus:outline-none"
                  >
                    稍后提醒
                  </button>
                )}
                <button
                  onClick={() => handleReminderAction('tomorrow')}
                  className="flex-1 py-2.5 rounded-full bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors text-sm outline-none focus:outline-none"
                >
                  明天再说
                </button>
              </div>
            </div>
          </>
        )}

        {/* === Mode: Morning === */}
        {mode === 'morning' && (
          <>
            <div className="flex items-center space-x-2 text-stone-800 font-medium mb-1 sticky top-0 bg-[#fcfcfc]/90 backdrop-blur-md pb-3 z-10">
              <Sparkles className="w-5 h-5 text-stone-400" />
              <span className="text-[17px]">今天可以继续处理这些事：</span>
            </div>
            
            <div className="flex flex-col gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
              {tasks.map((task) => (
                <div key={task.id} className="bg-stone-50/50 p-5 rounded-[24px] flex flex-col gap-4">
                  <p className="text-stone-700 text-[15px] leading-relaxed">{task.originalText}</p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelections({ ...selections, [task.id]: 'done' })}
                      className={`flex-1 py-2 rounded-full text-[13px] font-medium transition-all ${
                        selections[task.id] === 'done' 
                          ? 'bg-stone-900 text-white shadow-md' 
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      完成
                    </button>
                    <button
                      onClick={() => setSelections({ ...selections, [task.id]: 'later' })}
                      className={`flex-1 py-2 rounded-full text-[13px] font-medium transition-all ${
                        selections[task.id] === 'later' 
                          ? 'bg-stone-600 text-white shadow-md' 
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      稍后
                    </button>
                    <button
                      onClick={() => setSelections({ ...selections, [task.id]: 'tomorrow' })}
                      className={`flex-1 py-2 rounded-full text-[13px] font-medium transition-all ${
                        selections[task.id] === 'tomorrow' 
                          ? 'bg-stone-600 text-white shadow-md' 
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      改天
                    </button>
                    <button
                      onClick={() => setSelections({ ...selections, [task.id]: 'cancel' })}
                      className={`flex-1 py-2 rounded-full text-[13px] font-medium transition-all ${
                        selections[task.id] === 'cancel' 
                          ? 'bg-stone-300 text-stone-800 shadow-sm' 
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      不做了
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-[#fcfcfc]/90 backdrop-blur-md pt-4 pb-1 mt-2 flex justify-between items-center z-10" style={{ WebkitAppRegion: 'no-drag' } as any}>
               <button 
                  onClick={() => window.electronAPI?.hideWindow()}
                  className="px-5 py-2.5 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full text-sm font-medium transition-colors"
               >
                 稍后再看
               </button>
               <button
                onClick={handleMorningSubmit}
                className="px-6 py-2.5 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm flex items-center gap-2 text-[15px]"
              >
                确认操作 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* === Mode: Review === */}
        {mode === 'review' && (
          <>
            <div className="flex items-center space-x-2 text-stone-800 font-medium mb-2">
              <FileText className="w-5 h-5 text-stone-400" />
              <span className="text-lg">晚间复盘</span>
            </div>
            
            {isReviewDone ? (
               <>
                 <div className="bg-stone-50 p-6 rounded-[24px] mb-4 flex flex-col items-center justify-center py-8 gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <CheckCircle className="w-10 h-10 text-stone-300" strokeWidth={1.5} />
                    <p className="text-stone-600 text-[15px] font-medium">今天已经复盘过啦，早点休息吧</p>
                 </div>
                 <div className="flex gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <button
                       onClick={() => { window.electronAPI?.openTodayReview?.(); window.electronAPI?.hideWindow(); }}
                       className="flex-1 py-2.5 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm text-sm"
                    >
                       查看今日日记
                    </button>
                    <button
                       onClick={async () => {
                         await window.electronAPI?.deleteTodayReview?.();
                         setIsReviewDone(false);
                       }}
                       className="px-5 py-2.5 rounded-full bg-rose-50 text-rose-600 font-medium hover:bg-rose-100 transition-colors shadow-sm text-sm"
                       title="删除今天的日记文件并重新生成"
                    >
                       删除重写
                    </button>
                    <button
                       onClick={() => window.electronAPI?.hideWindow()}
                       className="px-5 py-2.5 rounded-full bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors shadow-sm text-sm"
                    >
                       关闭
                    </button>
                 </div>
               </>
            ) : (
               <>
                 <div className="bg-stone-50/50 p-5 rounded-[24px] mb-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
                    <p className="text-stone-800 text-[15px] mb-1 font-medium">今天你记录了 <span className="font-bold text-lg">{entryCount}</span> 条想法。</p>
                    <p className="text-stone-500 text-[13px]">我可以帮你生成今天的思维日记和长期总结。</p>
                 </div>

                 {loading ? (
                    <div className="w-full py-5 flex items-center justify-center space-x-3 text-stone-600 font-medium text-sm" style={{ WebkitAppRegion: 'no-drag' } as any}>
                       <div className="w-5 h-5 border-2 border-stone-800 border-t-transparent rounded-full animate-spin"></div>
                       <span>{draft ? '正在写入...' : '正在生成草稿...'}</span>
                    </div>
                 ) : draft ? (
                    <div className="flex flex-col gap-4" style={{ WebkitAppRegion: 'no-drag' } as any}>
                      <div className="bg-white p-4 rounded-[20px] border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                         <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">今日日记预览 (可编辑)</label>
                         <textarea 
                           value={draft.diaryContent || ''}
                           onChange={(e) => setDraft({ ...draft, diaryContent: e.target.value })}
                           className="w-full min-h-[200px] text-[15px] text-stone-700 bg-transparent border-none p-0 focus:outline-none resize-y leading-relaxed"
                         />
                      </div>
                      {draft.longTermUpdates?.length > 0 && (
                        <div className="bg-white p-4 rounded-[20px] border border-stone-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                           <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">长期总结更新 ({draft.longTermUpdates.length}条)</label>
                           <div className="space-y-4">
                             {draft.longTermUpdates.map((update: any, idx: number) => (
                               <div key={idx} className="flex flex-col gap-2">
                                 <span className="text-[13px] font-semibold text-stone-800">主题: {update.topic}</span>
                                 <textarea 
                                   value={update.content || ''}
                                   onChange={(e) => {
                                     const newUpdates = [...draft.longTermUpdates];
                                     newUpdates[idx].content = e.target.value;
                                     setDraft({ ...draft, longTermUpdates: newUpdates });
                                   }}
                                   className="w-full min-h-[60px] text-[14px] text-stone-600 bg-transparent border-none p-0 focus:outline-none resize-y leading-relaxed"
                                 />
                               </div>
                             ))}
                           </div>
                        </div>
                      )}
                      <div className="flex gap-3 mt-2">
                         <button
                            onClick={handleSaveDraft}
                            className="flex-1 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm flex items-center justify-center gap-2 text-[15px]"
                         >
                            <CheckCircle className="w-4 h-4" /> 确认无误并写入
                         </button>
                         <button
                            onClick={() => setDraft(null)}
                            className="px-6 py-3 rounded-full bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors shadow-sm text-[15px]"
                         >
                            取消
                         </button>
                      </div>
                    </div>
                 ) : (
                    <div className="flex gap-3" style={{ WebkitAppRegion: 'no-drag' } as any}>
                       <button
                          onClick={handleReviewGenerate}
                          className="flex-1 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm text-[15px]"
                       >
                          生成复盘草稿
                       </button>
                       <button
                          onClick={() => window.electronAPI?.hideWindow()}
                          className="px-6 py-3 rounded-full bg-stone-100 text-stone-600 font-medium hover:bg-stone-200 transition-colors shadow-sm text-[15px]"
                       >
                          稍后
                       </button>
                    </div>
                 )}
               </>
            )}
          </>
        )}

      </div>
    </div>
  );
}
