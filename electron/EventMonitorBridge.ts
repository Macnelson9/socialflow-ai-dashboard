import { ipcMain, BrowserWindow } from 'electron';
import { EventMonitorService, BlockchainEvent, BlockchainEventType } from '../blockchain/services/EventMonitorService';

export class EventMonitorBridge {
  private eventMonitor: EventMonitorService;
  private mainWindow: BrowserWindow | null = null;
  private eventBatch: BlockchainEvent[] = [];
  private batchInterval: NodeJS.Timeout | null = null;
  private batchSize = 10;
  private batchTimeout = 1000;

  constructor(horizonUrl?: string) {
    this.eventMonitor = new EventMonitorService(horizonUrl);
    this.setupIpcHandlers();
  }

  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  private setupIpcHandlers(): void {
    ipcMain.handle('blockchain:start-monitoring', async (_, accountId: string) => {
      try {
        this.setupEventListeners();
        await this.eventMonitor.startMonitoring(accountId);
        this.startBatching();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });

    ipcMain.handle('blockchain:stop-monitoring', () => {
      try {
        this.eventMonitor.stopMonitoring();
        this.stopBatching();
        return { success: true };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    });
  }

  private setupEventListeners(): void {
    Object.values(BlockchainEventType).forEach((eventType) => {
      this.eventMonitor.on(eventType as BlockchainEventType, (event) => {
        this.addEventToBatch(event);
      });
    });
  }

  private addEventToBatch(event: BlockchainEvent): void {
    this.eventBatch.push(event);

    if (this.eventBatch.length >= this.batchSize) {
      this.flushBatch();
    }
  }

  private startBatching(): void {
    if (this.batchInterval) return;

    this.batchInterval = setInterval(() => {
      if (this.eventBatch.length > 0) {
        this.flushBatch();
      }
    }, this.batchTimeout);
  }

  private stopBatching(): void {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
    this.flushBatch();
  }

  private flushBatch(): void {
    if (!this.mainWindow || this.eventBatch.length === 0) return;

    try {
      this.mainWindow.webContents.send('blockchain:events', this.eventBatch);
      this.eventBatch = [];
    } catch (error) {
      console.error('Failed to send events to renderer:', error);
    }
  }

  cleanup(): void {
    this.eventMonitor.stopMonitoring();
    this.stopBatching();
    ipcMain.removeHandler('blockchain:start-monitoring');
    ipcMain.removeHandler('blockchain:stop-monitoring');
  }
}
