import { app, BrowserWindow, ipcMain, screen, Tray, Menu, globalShortcut, shell, nativeImage } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.js
// │
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST;

let mainWindow: BrowserWindow | null;
let canHideMainWindow = true;
let tray: Tray | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 220,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }

  mainWindow.on('blur', () => {
    // Hide window when it loses focus, but only if allowed
    if (canHideMainWindow) {
      mainWindow?.hide();
    }
  });
}

let settingsWindow: BrowserWindow | null = null;

function showSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 700,
    minWidth: 480,
    minHeight: 650,
    show: false,
    title: '系统设置',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    settingsWindow.loadURL(VITE_DEV_SERVER_URL + '#/settings');
  } else {
    settingsWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'settings' });
  }

  settingsWindow.once('ready-to-show', () => {
    settingsWindow?.show();
  });

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

let todayWindow: BrowserWindow | null = null;

function showTodayWindow() {
  if (todayWindow) {
    todayWindow.show();
    todayWindow.focus();
    return;
  }

  todayWindow = new BrowserWindow({
    width: 600,
    height: 800,
    minWidth: 500,
    minHeight: 600,
    show: false,
    title: '今日记录',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    todayWindow.loadURL(VITE_DEV_SERVER_URL + '#/today');
  } else {
    todayWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'today' });
  }

  todayWindow.once('ready-to-show', () => {
    todayWindow?.show();
  });

  todayWindow.on('closed', () => {
    todayWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(process.env.VITE_PUBLIC || '', 'vite.svg');
  let icon: Electron.NativeImage;
  
  if (fs.existsSync(iconPath)) {
    icon = nativeImage.createFromPath(iconPath);
  } else {
    icon = nativeImage.createEmpty();
  }

  const config = configStore.getAll();
  const shortcutDisplay = (config.shortcut || 'CommandOrControl+`').replace('CommandOrControl', 'Ctrl');

  const currentTheme = config.theme || 'pastel';
  const changeTheme = (newTheme: 'pastel' | 'macos-dark' | 'ios-acrylic') => {
    const currentConfig = configStore.getAll();
    currentConfig.theme = newTheme;
    configStore.setAll(currentConfig);
    if (mainWindow) {
      mainWindow.webContents.send('theme-changed', newTheme);
    }
  };

  const contextMenu = Menu.buildFromTemplate([
    { label: `记下想法 (${shortcutDisplay})`, click: () => showMainWindow() },
    { label: '今日时间线', click: () => showTodayWindow() },
    { type: 'separator' },
    { label: '切换皮肤', submenu: [
      { label: '方案一：粉彩光晕 (Pastel)', type: 'radio', checked: currentTheme === 'pastel', click: () => changeTheme('pastel') },
      { label: '方案二：macOS 暗黑高级 (Obsidian)', type: 'radio', checked: currentTheme === 'macos-dark', click: () => changeTheme('macos-dark') },
      { label: '方案三：iOS 拟物厚亚克力 (Acrylic)', type: 'radio', checked: currentTheme === 'ios-acrylic', click: () => changeTheme('ios-acrylic') }
    ]},
    { type: 'separator' },
    { label: '立即晚间复盘', click: () => showReviewWindow() },
    { label: '打开笔记文件夹', click: () => {
        const currentConfig = configStore.getAll();
        if (currentConfig.obsidianPath) {
          shell.openPath(currentConfig.obsidianPath);
        }
      } 
    },
    { type: 'separator' },
    { label: '设置', click: () => showSettingsWindow() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]);
  tray = new Tray(icon);
  tray.setToolTip('思维记录');
  tray.setContextMenu(contextMenu);
}

function showMainWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();
    // Send event to renderer to focus input
    mainWindow.webContents.send('window-show');
  }
}

import { analyzeIntent } from './ai.js';
import { Store } from './store.js';

// Types for store
interface AppConfig {
  obsidianPath: string;
  apiKey: string;
  apiBaseUrl: string;
  modelName: string;
  morningTime: string;
  afternoonTime: string;
  eveningTime: string;
  customReviewPrompt?: string;
  autoStart?: boolean;
  shortcut?: string;
  parentFolderName?: string;
  diaryFolderName?: string;
  summaryFolderName?: string;
  theme?: 'pastel' | 'macos-dark' | 'ios-acrylic';
}

const configStore = new Store<AppConfig>('config.json', {
  obsidianPath: '',
  apiKey: '',
  apiBaseUrl: '',
  modelName: 'gpt-3.5-turbo',
  morningTime: '09:00',
  afternoonTime: '15:00',
  eveningTime: '22:00',
  shortcut: 'CommandOrControl+`',
  parentFolderName: '提示助手',
  diaryFolderName: '每日日记',
  summaryFolderName: '长期总结',
  theme: 'pastel'
});

const entriesStore = new Store<any[]>('entries.json', []);
const tasksStore = new Store<any[]>('tasks.json', []);
const remindersStore = new Store<any[]>('reminders.json', []);

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register Global Shortcut
  const config = configStore.getAll();
  
  app.setLoginItemSettings({
    openAtLogin: config.autoStart || false,
    openAsHidden: true
  });

  const shortcut = config.shortcut || 'CommandOrControl+`';
  
  try {
    globalShortcut.register(shortcut, () => {
      if (mainWindow?.isVisible()) {
        mainWindow.hide();
      } else {
        showMainWindow();
      }
    });
  } catch (e) {
    console.error('Failed to register shortcut:', e);
  }

  // Startup Checks
  if (!config.obsidianPath) {
    showSettingsWindow();
  } else {
    // Check if yesterday review was missed
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    
    const allEntries = entriesStore.getAll();
    const hasUnreviewedOldEntries = allEntries.some(e => !e.hasReviewed && e.timestamp < todayStr);

    if (hasUnreviewedOldEntries && !isReviewDoneToday(config, yesterdayStr)) {
      const { Notification } = require('electron');
      const notification = new Notification({
        title: '补昨天复盘',
        body: '昨天还没有生成思维日记，要现在补上吗？ 点击开始'
      });
      notification.on('click', () => {
        showReviewWindow();
      });
      notification.show();
    }
  }

  ipcMain.on('set-can-hide', (_event, canHide: boolean) => {
    canHideMainWindow = canHide;
  });

  ipcMain.on('hide-window', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.hide();
    }
  });

  ipcMain.on('close-settings', () => {
    settingsWindow?.close();
  });

  ipcMain.handle('get-today-entries', () => {
    const entries = entriesStore.getAll();
    const todayStr = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.timestamp.startsWith(todayStr));
  });

  ipcMain.handle('get-today-entry-count', () => {
    const entries = entriesStore.getAll();
    const todayStr = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.timestamp.startsWith(todayStr) && e.status === 'analyzed').length;
  });

  ipcMain.handle('get-config', () => {
    return configStore.getAll();
  });

  ipcMain.handle('save-config', (_event, newConfig) => {
    const oldConfig = configStore.getAll();
    if (oldConfig.shortcut !== newConfig.shortcut) {
      if (oldConfig.shortcut) {
        globalShortcut.unregister(oldConfig.shortcut);
      }
      if (newConfig.shortcut) {
        try {
          globalShortcut.register(newConfig.shortcut, () => {
            if (mainWindow?.isVisible()) {
              mainWindow.hide();
            } else {
              showMainWindow();
            }
          });
        } catch (e) {
          console.error('Failed to update shortcut:', e);
        }
      }
    }
    
    // Apply autoStart setting
    if (oldConfig.autoStart !== newConfig.autoStart) {
      app.setLoginItemSettings({
        openAtLogin: newConfig.autoStart || false,
        openAsHidden: true
      });
    }

    configStore.setAll(newConfig);
    
    // Recreate tray to update shortcut label
    if (tray) {
      tray.destroy();
    }
    createTray();

    return { success: true };
  });

  ipcMain.handle('quick-save', async (event, text: string) => {
    const entryId = Date.now().toString();
    const entries = entriesStore.getAll();
    entries.push({
      id: entryId,
      text,
      timestamp: new Date().toISOString(),
      status: 'analyzed',
      aiResult: { type: 'normal', reply: '已记录（跳过分析）' }
    });
    entriesStore.setAll(entries);
    return { success: true };
  });

  ipcMain.handle('analyze-input', async (event, text: string) => {
    const entryId = Date.now().toString();
    const config = configStore.getAll();
    
    // Save raw input first
    const newEntry = {
      id: entryId,
      text,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    const entries = entriesStore.getAll();
    entries.push(newEntry);
    entriesStore.setAll(entries);

    try {
      // Call AI
      if (!config.apiKey) {
        return { reply: '已记录，但未配置 API Key，无法分析意图。', type: 'normal' };
      }
      const result = await analyzeIntent(text, config.apiKey, config.apiBaseUrl, config.modelName);
      
      // Update entry with result
      const index = entries.findIndex(e => e.id === entryId);
      if (index !== -1) {
        entries[index].status = 'analyzed';
        entries[index].aiResult = result;
        entriesStore.setAll(entries);
      }

      // If task, save to tasks
      if (result.type === 'task') {
        const tasks = tasksStore.getAll();
        tasks.push({
          id: 'task_' + entryId,
          entryId,
          originalText: text,
          title: text,
          type: result.type,
          status: 'pending',
          createdAt: new Date().toISOString()
        });
        tasksStore.setAll(tasks);
      } else if (result.type === 'reminder') {
        const reminders = remindersStore.getAll();
        
        let targetTime = new Date(Date.now() + 60*60*1000).toISOString();
        if (result.reminderTime && !isNaN(new Date(result.reminderTime).getTime())) {
          targetTime = new Date(result.reminderTime).toISOString();
        }

        reminders.push({
          id: 'rem_' + entryId,
          entryId,
          originalText: text,
          title: text,
          type: result.type,
          status: 'pending',
          remindAt: targetTime,
          createdAt: new Date().toISOString()
        });
        remindersStore.setAll(reminders);
      }

      return result;
    } catch (error) {
      console.error(error);
      return { reply: '已记录，但 AI 分析失败。', type: 'error' };
    }
  });

  ipcMain.handle('handle-reminder-action', async (event, taskId: string, action: string) => {
    const reminders = remindersStore.getAll();
    const taskIndex = reminders.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      if (action === 'done') {
        reminders[taskIndex].status = 'completed';
      } else if (action === 'later') {
        reminders[taskIndex].status = 'delayed';
        reminders[taskIndex].remindAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes later
        
        // Record this action in the timeline
        const entries = entriesStore.getAll();
        entries.push({
          id: Date.now().toString(),
          text: `稍后提醒：${reminders[taskIndex].originalText}`,
          timestamp: new Date().toISOString(),
          status: 'analyzed',
          aiResult: { type: 'reminder', reply: '已推迟，将在 30 分钟后再次提醒。' }
        });
        entriesStore.setAll(entries);

      } else if (action === 'tomorrow') {
        reminders[taskIndex].status = 'delayed';
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        reminders[taskIndex].remindAt = tomorrow.toISOString();
      }
      remindersStore.setAll(reminders);
    }
    reminderWindow?.hide();
  });

  ipcMain.handle('handle-morning-actions', async (event, actions: {taskId: string, action: string}[]) => {
    const tasks = tasksStore.getAll();
    const now = new Date();
    const config = configStore.getAll();
    
    const pmTimeStr = config.afternoonTime || '15:00';
    const pmTime = new Date();
    const [h, m] = pmTimeStr.split(':');
    pmTime.setHours(parseInt(h), parseInt(m), 0, 0);

    const pmLateTime = new Date();
    pmLateTime.setHours(18, 0, 0, 0);

    actions.forEach(act => {
      const taskIndex = tasks.findIndex(t => t.id === act.taskId);
      if (taskIndex !== -1) {
        if (act.action === 'done') {
          tasks[taskIndex].status = 'completed';
        } else if (act.action === 'cancel') {
          tasks[taskIndex].status = 'cancelled';
        } else if (act.action === 'later') {
          tasks[taskIndex].status = 'delayed';
          if (now < pmTime) {
            tasks[taskIndex].remindAt = pmTime.toISOString();
          } else if (now < pmLateTime) {
            tasks[taskIndex].remindAt = pmLateTime.toISOString();
          } else {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const [mh, mm] = (config.morningTime || '09:00').split(':');
            tomorrow.setHours(parseInt(mh), parseInt(mm), 0, 0);
            tasks[taskIndex].remindAt = tomorrow.toISOString();
          }
        } else if (act.action === 'tomorrow') {
          tasks[taskIndex].status = 'delayed';
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const [mh, mm] = (config.morningTime || '09:00').split(':');
          tomorrow.setHours(parseInt(mh), parseInt(mm), 0, 0);
          tasks[taskIndex].remindAt = tomorrow.toISOString();
        }
      }
    });
    tasksStore.setAll(tasks);
    reminderWindow?.hide();
  });

  ipcMain.handle('get-today-entry-count', async () => {
    const entries = entriesStore.getAll();
    const todayStr = new Date().toISOString().split('T')[0];
    return entries.filter(e => e.timestamp.startsWith(todayStr)).length;
  });

  // Set Auto-launch
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

const reviewStore = new Store<any>('review_state.json', { lastReviewDate: '', lastMorningDate: '' });

  // Intelligent Cron (check every minute)
  setInterval(() => {
    const tasks = tasksStore.getAll();
    const reminders = remindersStore.getAll();
    const now = new Date();
    const config = configStore.getAll();
    const todayStr = now.toISOString().split('T')[0];
    const reviewState = reviewStore.getAll();

    // 1. Morning Tasks Check
    const [mh, mm] = (config.morningTime || '09:00').split(':');
    const morningTime = new Date();
    morningTime.setHours(parseInt(mh), parseInt(mm), 0, 0);
    
    if (now >= morningTime && reviewState.lastMorningDate !== todayStr) {
      const pendingTasks = tasks.filter(t => 
        t.status === 'pending' || (t.status === 'delayed' && new Date(t.remindAt) <= now)
      );
      if (pendingTasks.length > 0) {
        showMorningWindow(pendingTasks);
        reviewState.lastMorningDate = todayStr;
        reviewStore.setAll(reviewState);
      }
    } else if (reviewState.lastMorningDate === todayStr) {
      // Afternoon later tasks check
      const dueDelayedTasks = tasks.filter(t => t.status === 'delayed' && new Date(t.remindAt) <= now);
      if (dueDelayedTasks.length > 0 && (!reminderWindow || !reminderWindow.isVisible())) {
        showMorningWindow(dueDelayedTasks);
        // bump their time slightly so it doesn't infinite loop if ignored
        dueDelayedTasks.forEach(t => { t.remindAt = new Date(Date.now() + 5*60*1000).toISOString(); });
        tasksStore.setAll(tasks);
      }
    }

    // 2. Exact Reminders Check
    const dueReminders = reminders.filter(r => r.status === 'pending' && new Date(r.remindAt) <= now);
    if (dueReminders.length > 0 && (!reminderWindow || !reminderWindow.isVisible())) {
      showReminderWindow(dueReminders[0]);
      dueReminders[0].status = 'shown'; // Prevent loop
      remindersStore.setAll(reminders);
    }

    // 3. Evening Review Check
    const [eh, em] = (config.eveningTime || '22:00').split(':');
    const eveningTime = new Date();
    eveningTime.setHours(parseInt(eh), parseInt(em), 0, 0);
    
    if (now >= eveningTime && reviewState.lastReviewDate !== todayStr) {
      showReviewWindow();
      reviewState.lastReviewDate = todayStr;
      reviewStore.setAll(reviewState);
    }
    // 4. Weekly Review Check
    if (config.weeklyReview?.enabled !== false) {
      checkWeeklyReview(now, config, reviewState);
    }
  }, 60000); // Check every minute
});

import { getISOWeekData, getWeekRange, generateWeeklyReview } from './weekly-review.js';

async function checkWeeklyReview(now: Date, config: any, reviewState: any) {
  if (!reviewState.weekly_reviews) reviewState.weekly_reviews = {};
  
  const [wh, wm] = (config.weeklyReview?.time || '22:30').split(':');
  
  let targetDate = new Date(now);
  const currentDay = targetDate.getDay();
  if (currentDay === 0 && (now.getHours() * 60 + now.getMinutes() >= parseInt(wh) * 60 + parseInt(wm))) {
    // Current week is ready
  } else {
    // Target previous week
    const diffToLastSunday = currentDay === 0 ? 7 : currentDay;
    targetDate.setDate(targetDate.getDate() - diffToLastSunday);
    targetDate.setHours(parseInt(wh), parseInt(wm), 0, 0);
  }

  const weekId = getISOWeekData(targetDate);
  const range = getWeekRange(targetDate);
  
  const ws = reviewState.weekly_reviews[weekId] || { status: 'pending' };

  let shouldPrompt = false;
  let isMissed = false;

  if (ws.status === 'pending') {
    const triggerTime = new Date(range.end); 
    triggerTime.setHours(parseInt(wh), parseInt(wm), 0, 0);

    if (now >= triggerTime) {
      shouldPrompt = true;
      if (now > new Date(triggerTime.getTime() + 60*60*1000)) { 
        isMissed = true;
      }
    }
  } else if (ws.status === 'snoozed') {
    if (ws.next_prompt_at && new Date(ws.next_prompt_at) <= now) {
      shouldPrompt = true;
      isMissed = true; // if snoozed, it's definitely late
    }
  }

  if (shouldPrompt) {
    ws.status = 'prompting';
    reviewState.weekly_reviews[weekId] = ws;
    reviewStore.setAll(reviewState);
    
    handleWeeklyReviewPrompt(weekId, range, isMissed, config, reviewState);
  }
}

async function handleWeeklyReviewPrompt(weekId: string, range: any, isMissed: boolean, config: any, reviewState: any) {
  const msg = isMissed 
    ? `上周还没有生成每周复盘。\n\n时间范围：${range.start.toISOString().split('T')[0]} 至 ${range.end.toISOString().split('T')[0]}`
    : `准备生成每周复盘\n\n时间范围：${range.start.toISOString().split('T')[0]} 至 ${range.end.toISOString().split('T')[0]}`;

  const { response } = await dialog.showMessageBox({
    type: 'question',
    title: '每周复盘',
    message: msg,
    buttons: ['现在生成/直接写入', '今天晚上提醒/稍后', '跳过本周', '取消'],
    cancelId: 3
  });

  const ws = reviewState.weekly_reviews[weekId];

  if (response === 0) { // 现在生成
    ws.status = 'generating';
    reviewState.weekly_reviews[weekId] = ws;
    reviewStore.setAll(reviewState);
    
    try {
      const content = await generateWeeklyReview(config, weekId, range, tasksStore, entriesStore);
      if (config.obsidianPath) {
        const outDir = path.join(config.obsidianPath, '周期复盘', '每周复盘');
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        let file = path.join(outDir, `${weekId}.md`);
        if (fs.existsSync(file)) {
          file = path.join(outDir, `${weekId}_补充.md`);
        }
        fs.writeFileSync(file, content, 'utf-8');
        
        ws.status = 'generated';
        dialog.showMessageBox({ type: 'info', title: '每周复盘', message: '每周复盘生成成功并已写入！' });
      }
    } catch (e: any) {
      ws.status = 'snoozed';
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      ws.next_prompt_at = tomorrow.toISOString();
      dialog.showErrorBox('生成失败', e.message);
    }
  } else if (response === 1) { // 稍后
    ws.status = 'snoozed';
    const next = new Date();
    if (isMissed) {
      next.setHours(22, 0, 0, 0); // Tonight 22:00
      if (next <= new Date()) next.setDate(next.getDate() + 1);
    } else {
      next.setHours(next.getHours() + 1); // 1 hour later
    }
    ws.next_prompt_at = next.toISOString();
  } else if (response === 2) { // 跳过
    ws.status = 'skipped';
  } else {
    ws.status = 'snoozed';
    const next = new Date();
    next.setHours(22, 0, 0, 0);
    if (next <= new Date()) next.setDate(next.getDate() + 1);
    ws.next_prompt_at = next.toISOString();
  }
  
  reviewState.weekly_reviews[weekId] = ws;
  reviewStore.setAll(reviewState);
}

import { generateReviewDraft, saveReview, isReviewDoneToday } from './review.js';

ipcMain.handle('generate-review-draft', async () => {
  const entries = entriesStore.getAll();
  const tasks = tasksStore.getAll();
  const config = configStore.getAll();
  const todayStr = new Date().toISOString().split('T')[0];
  
  // filter today's entries
  const todayEntries = entries.filter(e => e.timestamp.startsWith(todayStr));
  
  try {
    const draft = await generateReviewDraft(todayEntries, tasks, config);
    return { success: true, draft };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
});

  ipcMain.handle('save-review', async (_event, draft: any) => {
    try {
      const config = configStore.getAll();
      await saveReview(draft, config);
      
      const entries = entriesStore.getAll();
      const dateStr = new Date().toISOString().split('T')[0];
      let updated = false;
      for (const e of entries) {
        if (!e.hasReviewed && e.timestamp <= dateStr + "T23:59:59") {
          e.hasReviewed = true;
          updated = true;
        }
      }
      if (updated) entriesStore.set(entries);

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('delete-today-review', () => {
    const config = configStore.getAll();
    const dateStr = new Date().toISOString().split('T')[0];
    const parentDir = config.parentFolderName || '提示助手';
    const diaryDir = config.diaryFolderName || '每日日记';
    const diaryPath = path.join(config.obsidianPath, parentDir, diaryDir, `${dateStr}.md`);
    
    if (fs.existsSync(diaryPath)) {
      fs.unlinkSync(diaryPath);
    }
    
    const entries = entriesStore.getAll();
    let updated = false;
    for (const e of entries) {
      if (e.timestamp.startsWith(dateStr) && e.hasReviewed) {
        e.hasReviewed = false;
        updated = true;
      }
    }
    if (updated) entriesStore.set(entries);
    
    return true;
  });

  ipcMain.handle('check-review-status', () => {
    return isReviewDoneToday(configStore.getAll());
  });

  ipcMain.handle('open-today-review', () => {
    const config = configStore.getAll();
    const dateStr = new Date().toISOString().split('T')[0];
    const parentDir = config.parentFolderName || '提示助手';
    const diaryDir = config.diaryFolderName || '每日日记';
    const diaryPath = path.join(config.obsidianPath, parentDir, diaryDir, `${dateStr}.md`);
    shell.openPath(diaryPath);
  });

let reminderWindow: BrowserWindow | null = null;


function showReviewWindow() {
  if (!reminderWindow) {
    createReminderWindowInternal();
    reminderWindow?.webContents.once('did-finish-load', () => {
      reminderWindow?.show();
      reminderWindow?.webContents.send('review-show');
      shell.beep();
    });
  } else {
    reminderWindow?.show();
    reminderWindow?.webContents.send('review-show');
    shell.beep();
  }
}

function showMorningWindow(tasks: any[]) {
  if (!reminderWindow) {
    createReminderWindowInternal();
    reminderWindow?.webContents.once('did-finish-load', () => {
      reminderWindow?.show();
      reminderWindow?.webContents.send('morning-show', tasks);
      shell.beep();
    });
  } else {
    reminderWindow?.show();
    reminderWindow?.webContents.send('morning-show', tasks);
    shell.beep();
  }
}

function showReminderWindow(task: any) {
  if (!reminderWindow) {
    createReminderWindowInternal();
    reminderWindow?.webContents.once('did-finish-load', () => {
      reminderWindow?.show();
      reminderWindow?.webContents.send('reminder-show', task);
      shell.beep();
    });
  } else {
    reminderWindow?.show();
    reminderWindow?.webContents.send('reminder-show', task);
    shell.beep();
  }
}

function createReminderWindowInternal() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    reminderWindow = new BrowserWindow({
      width: 400,
      height: 650,
      x: 30,
      y: height - 690,
      show: false,
      frame: false,
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow: false,
      resizable: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.mjs'),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });

    if (VITE_DEV_SERVER_URL) {
      reminderWindow.loadURL(VITE_DEV_SERVER_URL + '#/reminder');
    } else {
      reminderWindow.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'reminder' });
    }

    reminderWindow.on('blur', () => {
      // Allow closing when losing focus if desired, but user asked for interaction
    });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainWindow = null;
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
