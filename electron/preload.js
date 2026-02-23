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
  }
});