const { app, BrowserWindow } = require('electron');
const path = require('path');

let eventMonitorBridge;

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0d0f11',
    titleBarStyle: 'hidden', // Frameless window
    titleBarOverlay: {
      color: '#0d0f11',
      symbolColor: '#ffffff',
      height: 40
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Initialize event monitor bridge
  if (!eventMonitorBridge) {
    const { EventMonitorBridge } = require('./EventMonitorBridge');
    eventMonitorBridge = new EventMonitorBridge('https://horizon-testnet.stellar.org');
  }
  eventMonitorBridge.setMainWindow(win);

  // In development, load from Vite dev server
  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
    // win.webContents.openDevTools(); // Uncomment to debug
  } else {
    // In production, load the built html
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (eventMonitorBridge) {
    eventMonitorBridge.cleanup();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});