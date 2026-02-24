const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => {
    let validChannels = ["toMain"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  blockchain: {
    startMonitoring: (accountId) => ipcRenderer.invoke('blockchain:start-monitoring', accountId),
    stopMonitoring: () => ipcRenderer.invoke('blockchain:stop-monitoring'),
    onEvents: (callback) => {
      ipcRenderer.on('blockchain:events', (_, events) => callback(events));
      return () => ipcRenderer.removeAllListeners('blockchain:events');
    }
  },
  notifications: {
    getPreferences: () => ipcRenderer.invoke('notifications:get-preferences'),
    setPreferences: (prefs) => ipcRenderer.invoke('notifications:set-preferences', prefs),
    getHistory: () => ipcRenderer.invoke('notifications:get-history'),
    clearHistory: () => ipcRenderer.invoke('notifications:clear-history'),
  }
});