let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	setCanHide: (canHide) => electron.ipcRenderer.send("set-can-hide", canHide),
	hideWindow: () => electron.ipcRenderer.send("hide-window"),
	analyzeInput: (text) => electron.ipcRenderer.invoke("analyze-input", text),
	quickSave: (text) => electron.ipcRenderer.invoke("quick-save", text),
	handleReminderAction: (taskId, action) => electron.ipcRenderer.invoke("handle-reminder-action", taskId, action),
	handleMorningActions: (actions) => electron.ipcRenderer.invoke("handle-morning-actions", actions),
	generateReviewDraft: () => electron.ipcRenderer.invoke("generate-review-draft"),
	saveReview: (draft) => electron.ipcRenderer.invoke("save-review", draft),
	getConfig: () => electron.ipcRenderer.invoke("get-config"),
	saveConfig: (config) => electron.ipcRenderer.invoke("save-config", config),
	closeSettings: () => electron.ipcRenderer.send("close-settings"),
	getTodayEntries: () => electron.ipcRenderer.invoke("get-today-entries"),
	getTodayEntryCount: () => electron.ipcRenderer.invoke("get-today-entry-count"),
	checkReviewStatus: () => electron.ipcRenderer.invoke("check-review-status"),
	openTodayReview: () => electron.ipcRenderer.invoke("open-today-review"),
	deleteTodayReview: () => electron.ipcRenderer.invoke("delete-today-review"),
	onWindowShow: (callback) => {
		electron.ipcRenderer.on("window-show", callback);
		return () => electron.ipcRenderer.removeAllListeners("window-show");
	},
	onReminderShow: (callback) => {
		const listener = (_event, task) => callback(task);
		electron.ipcRenderer.on("reminder-show", listener);
		return () => electron.ipcRenderer.removeListener("reminder-show", listener);
	},
	onMorningShow: (callback) => {
		const listener = (_event, tasks) => callback(tasks);
		electron.ipcRenderer.on("morning-show", listener);
		return () => electron.ipcRenderer.removeListener("morning-show", listener);
	},
	onReviewShow: (callback) => {
		electron.ipcRenderer.on("review-show", callback);
		return () => electron.ipcRenderer.removeAllListeners("review-show");
	},
	showThemeContextMenu: () => electron.ipcRenderer.send("show-theme-context-menu"),
	onThemeChange: (callback) => {
		const listener = (_event, theme) => callback(theme);
		electron.ipcRenderer.on("theme-changed", listener);
		return () => electron.ipcRenderer.removeListener("theme-changed", listener);
	}
});
//#endregion
