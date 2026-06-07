import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setCanHide: (canHide: boolean) => ipcRenderer.send('set-can-hide', canHide),
  hideWindow: () => ipcRenderer.send('hide-window'),
  analyzeInput: (text: string) => ipcRenderer.invoke('analyze-input', text),
  quickSave: (text: string) => ipcRenderer.invoke('quick-save', text),
  handleReminderAction: (taskId: string, action: string) => ipcRenderer.invoke('handle-reminder-action', taskId, action),
  generateReviewDraft: () => ipcRenderer.invoke('generate-review-draft'),
  saveReview: (draft: any) => ipcRenderer.invoke('save-review', draft),
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: any) => ipcRenderer.invoke('save-config', config),
  closeSettings: () => ipcRenderer.send('close-settings'),
  getTodayEntries: () => ipcRenderer.invoke('get-today-entries'),
  checkReviewStatus: () => ipcRenderer.invoke('check-review-status'),
  openTodayReview: () => ipcRenderer.invoke('open-today-review'),
  deleteTodayReview: () => ipcRenderer.invoke('delete-today-review'),
  onWindowShow: (callback: () => void) => {
    ipcRenderer.on('window-show', callback);
    return () => ipcRenderer.removeAllListeners('window-show');
  },
  onReminderShow: (callback: (task: any) => void) => {
    const listener = (_event: any, task: any) => callback(task);
    ipcRenderer.on('reminder-show', listener);
    return () => ipcRenderer.removeListener('reminder-show', listener);
  },
  onReviewShow: (callback: () => void) => {
    ipcRenderer.on('review-show', callback);
    return () => ipcRenderer.removeAllListeners('review-show');
  },
  showThemeContextMenu: () => ipcRenderer.send('show-theme-context-menu'),
  onThemeChange: (callback: (theme: 'pastel' | 'macos-dark' | 'ios-acrylic') => void) => {
    const listener = (_event: any, theme: any) => callback(theme);
    ipcRenderer.on('theme-changed', listener);
    return () => ipcRenderer.removeListener('theme-changed', listener);
  }
});
