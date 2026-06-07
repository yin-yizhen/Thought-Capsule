/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    setCanHide?: (canHide: boolean) => void;
    hideWindow: () => void;
    analyzeInput: (text: string) => Promise<any>;
    quickSave: (text: string) => Promise<any>;
    handleReminderAction: (taskId: string, action: string) => Promise<void>;
    handleMorningActions?: (actions: {taskId: string, action: string}[]) => Promise<void>;
    generateReviewDraft: () => Promise<{success: boolean, draft?: any, error?: string}>;
    saveReview: (draft: any) => Promise<{success: boolean, error?: string}>;
    getConfig: () => Promise<any>;
    saveConfig: (config: any) => Promise<void>;
    closeSettings: () => void;
    getTodayEntryCount?: () => Promise<number>;
    getTodayEntries?: () => Promise<any[]>;
    checkReviewStatus?: () => Promise<boolean>;
    openTodayReview?: () => Promise<void>;
    deleteTodayReview?: () => Promise<boolean>;
    onWindowShow: (callback: () => void) => () => void;
    onReminderShow?: (callback: (task: any) => void) => () => void;
    onMorningShow?: (callback: (tasks: any[]) => void) => () => void;
    onReviewShow?: (callback: () => void) => () => void;
    onWeeklyShow?: (callback: (data: any) => void) => () => void;
    handleWeeklyAction?: (action: string, data: any) => Promise<void>;
    showThemeContextMenu?: () => void;
    onThemeChange?: (callback: (theme: 'pastel' | 'macos-dark' | 'ios-acrylic') => void) => () => void;
  };
}
