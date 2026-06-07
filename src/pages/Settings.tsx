import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Save, X } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState({
    obsidianPath: '',
    apiKey: '',
    apiBaseUrl: '',
    modelName: 'gpt-3.5-turbo',
    morningTime: '09:00',
    afternoonTime: '15:00',
    eveningTime: '22:00',
    shortcut: 'CommandOrControl+`',
    autoStart: false,
    previewReview: true,
    customReviewPrompt: '',
    parentFolderName: '提示助手',
    diaryFolderName: '每日日记',
    summaryFolderName: '长期总结',
    weeklyReview: {
      enabled: true,
      time: '22:30'
    },
    sendKey: 'Shift+Enter' // default
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load config on mount
    window.electronAPI?.getConfig().then(c => {
      if (c) setConfig(c);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await window.electronAPI?.saveConfig(config);
      setSaving(false);
      setSaved(true);
    } catch (err) {
      setSaving(false);
      alert('保存失败，请重试');
    }
  };

  const handleCancel = () => {
    window.electronAPI?.closeSettings();
  };

  return (
    <div className="w-full h-screen bg-[#fcfcfc] text-stone-800 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-100 px-6 py-4 flex items-center gap-2 z-10">
        <SettingsIcon className="w-5 h-5 text-stone-500" />
        <h1 className="text-lg font-semibold text-stone-800 tracking-tight">系统设置</h1>
      </div>

      {/* Success Banner */}
      {saved && (
        <div className="bg-stone-900 text-white px-6 py-3 flex items-center justify-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <Save className="w-4 h-4" /> 设置已保存
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-md mx-auto space-y-6 pb-10">
          
          <div className="space-y-5 bg-white p-6 rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-stone-100">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">快捷键与基础配置</h2>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">全局呼出快捷键 *</label>
              <input 
                type="text"
                value={config.shortcut}
                readOnly
                onKeyDown={(e) => {
                  e.preventDefault();
                  const keys: string[] = [];
                  if (e.ctrlKey || e.metaKey) keys.push('CommandOrControl');
                  if (e.altKey) keys.push('Alt');
                  if (e.shiftKey) keys.push('Shift');
                  
                  if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
                    setConfig({...config, shortcut: keys.join('+') + '...'});
                    return;
                  }
                  
                  let key = e.key;
                  if (key === ' ') key = 'Space';
                  else if (key.length === 1) key = key.toUpperCase();
                  else if (key.startsWith('Arrow')) key = key.replace('Arrow', '');
                  else if (key === 'Escape') key = 'Esc';
                  
                  keys.push(key);
                  setConfig({...config, shortcut: keys.join('+')});
                  e.currentTarget.blur();
                }}
                placeholder="点击此处，然后直接按下你想设置的快捷键"
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white cursor-pointer select-none text-center font-mono font-medium text-stone-800"
              />
              <p className="text-[13px] text-stone-400 mt-2 text-center">
                请点击输入框，然后直接在键盘上按下组合键。
              </p>
            </div>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-stone-100">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">应用与体验设置</h2>
            
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-stone-700">开机自启</label>
                <p className="text-[13px] text-stone-400 mt-0.5">软件跟随系统启动，保证早晨能收到续接提醒</p>
              </div>
              <button 
                onClick={() => setConfig({...config, autoStart: !config.autoStart})}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none shadow-inner ${config.autoStart ? 'bg-stone-900' : 'bg-stone-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${config.autoStart ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-stone-100">
              <div>
                <label className="block text-sm font-medium text-stone-700">发送快捷键</label>
                <p className="text-[13px] text-stone-400 mt-0.5">选择你习惯的发送方式</p>
              </div>
              <select
                value={config.sendKey || 'Shift+Enter'}
                onChange={e => setConfig({...config, sendKey: e.target.value})}
                className="px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none text-[14px] text-stone-700"
              >
                <option value="Enter">Enter 发送，Shift+Enter 换行</option>
                <option value="Shift+Enter">Shift+Enter 发送，Enter 换行</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-stone-100">
              <div>
                <label className="block text-sm font-medium text-stone-700">晚间复盘：生成前预览</label>
                <p className="text-[13px] text-stone-400 mt-0.5">复盘时先展示草稿，确认后再写入 Markdown 文件</p>
              </div>
              <button 
                onClick={() => setConfig({...config, previewReview: !config.previewReview})}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none shadow-inner ${config.previewReview ? 'bg-stone-900' : 'bg-stone-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${config.previewReview ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            <div className="pt-5 border-t border-stone-100">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">自定义复盘日记 Prompt 模板 (可选)</label>
              <textarea 
                value={config.customReviewPrompt}
                onChange={e => setConfig({...config, customReviewPrompt: e.target.value})}
                placeholder="在此处填写你想要的 AI 语气、结构要求。留空则使用默认高质量模板。"
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white min-h-[120px] resize-y placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-stone-100">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">每周复盘配置</h2>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-stone-700">开启每周复盘</label>
                <p className="text-[13px] text-stone-400 mt-0.5">汇总一周记录，提炼思维趋势，默认周日晚触发</p>
              </div>
              <button 
                onClick={() => setConfig({...config, weeklyReview: {...(config.weeklyReview || {time: '22:30'}), enabled: !(config.weeklyReview?.enabled !== false)}})}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none shadow-inner ${config.weeklyReview?.enabled !== false ? 'bg-stone-900' : 'bg-stone-200'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${config.weeklyReview?.enabled !== false ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="pt-5 border-t border-stone-100">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">生成时间（周日）</label>
              <input 
                type="time"
                value={config.weeklyReview?.time || '22:30'}
                onChange={e => setConfig({...config, weeklyReview: {...(config.weeklyReview || {enabled: true}), time: e.target.value}})}
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-stone-100">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">AI 模型配置</h2>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">API Key *</label>
              <input 
                type="password"
                value={config.apiKey}
                onChange={e => setConfig({...config, apiKey: e.target.value})}
                placeholder="sk-..."
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">自定义 API 接口地址 (可选)</label>
              <input 
                type="text"
                value={config.apiBaseUrl}
                onChange={e => setConfig({...config, apiBaseUrl: e.target.value})}
                placeholder="例如: https://api.openai.com/v1"
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white placeholder:text-stone-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">模型名称</label>
              <input 
                type="text"
                value={config.modelName}
                onChange={e => setConfig({...config, modelName: e.target.value})}
                placeholder="例如: gpt-3.5-turbo"
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white placeholder:text-stone-400"
              />
            </div>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-stone-100">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">提醒时间配置</h2>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">早晨提醒时间</label>
              <input 
                type="time"
                value={config.morningTime}
                onChange={e => setConfig({...config, morningTime: e.target.value})}
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">下午提醒时间</label>
              <input 
                type="time"
                value={config.afternoonTime}
                onChange={e => setConfig({...config, afternoonTime: e.target.value})}
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">晚间复盘时间</label>
              <input 
                type="time"
                value={config.eveningTime}
                onChange={e => setConfig({...config, eveningTime: e.target.value})}
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white cursor-pointer"
              />
            </div>

            <div className="pt-5 border-t border-stone-100 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-stone-700">启用每周复盘 (周日晚)</label>
                <button
                  type="button"
                  onClick={() => setConfig({...config, weeklyReview: { ...config.weeklyReview, enabled: !config.weeklyReview?.enabled }})}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${config.weeklyReview?.enabled !== false ? 'bg-stone-900' : 'bg-stone-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${config.weeklyReview?.enabled !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {config.weeklyReview?.enabled !== false && (
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">每周复盘提醒时间</label>
                  <input 
                    type="time"
                    value={config.weeklyReview?.time || '22:30'}
                    onChange={e => setConfig({...config, weeklyReview: { ...config.weeklyReview, time: e.target.value }})}
                    className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white cursor-pointer"
                  />
                </div>
              )}
            </div>

            <p className="text-[13px] text-stone-400 mt-2">
              提示：修改后下次触发时生效。
            </p>
          </div>

          <div className="space-y-5 bg-white p-6 rounded-[24px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-stone-100">
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-widest">存储配置</h2>
            
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Obsidian 文件夹绝对路径 *</label>
              <input 
                type="text"
                value={config.obsidianPath}
                onChange={e => setConfig({...config, obsidianPath: e.target.value})}
                placeholder="例如: D:\Obsidian\MyVault"
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white placeholder:text-stone-400"
              />
            </div>
            
            <div className="pt-5 border-t border-stone-100">
              <label className="block text-sm font-medium text-stone-700 mb-1.5">总输出目录名称</label>
              <input 
                type="text"
                value={config.parentFolderName || '提示助手'}
                onChange={e => setConfig({...config, parentFolderName: e.target.value})}
                className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white placeholder:text-stone-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">日记子目录</label>
                <input 
                  type="text"
                  value={config.diaryFolderName || '每日日记'}
                  onChange={e => setConfig({...config, diaryFolderName: e.target.value})}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white placeholder:text-stone-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">总结子目录</label>
                <input 
                  type="text"
                  value={config.summaryFolderName || '长期总结'}
                  onChange={e => setConfig({...config, summaryFolderName: e.target.value})}
                  className="w-full px-4 py-3 border border-stone-200 rounded-2xl focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-all text-[15px] bg-stone-50/50 focus:bg-white placeholder:text-stone-400"
                />
              </div>
            </div>
            
            <p className="text-[13px] text-stone-400 mt-2">
              注意：修改文件夹名称后，只会对新生成的复盘生效。旧的日记文件不会自动移动，请您手动在 Obsidian 中移动。
            </p>
          </div>

        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white/80 backdrop-blur-md border-t border-stone-100 px-6 py-4 flex items-center justify-end gap-3 z-10">
        <button 
          onClick={handleCancel}
          className="px-5 py-2.5 text-sm font-medium text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" /> 取消
        </button>
        <button 
          onClick={handleSave}
          disabled={saving || saved}
          className={`px-6 py-2.5 text-sm font-medium text-white rounded-full transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 ${saved ? 'bg-stone-500' : 'bg-stone-900 hover:bg-stone-800 hover:shadow-md'}`}
        >
          <Save className="w-4 h-4" /> {saving ? '保存中...' : saved ? '✓ 已保存' : '保存设置'}
        </button>
      </div>

    </div>
  );
}
