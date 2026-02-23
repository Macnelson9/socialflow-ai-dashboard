const { ipcMain } = require('electron');
const { Horizon } = require('@stellar/stellar-sdk');

const BlockchainEventType = {
  PAYMENT: 'payment',
  TOKEN_TRANSFER: 'token_transfer',
  NFT_TRANSFER: 'nft_transfer',
  CONTRACT_EXECUTION: 'contract_execution',
  ACCOUNT_CREATED: 'account_created',
  TRUSTLINE_CREATED: 'trustline_created',
};

class EventMonitorService {
  constructor(horizonUrl = 'https://horizon-testnet.stellar.org') {
    this.server = new Horizon.Server(horizonUrl);
    this.listeners = new Map();
    this.closeHandlers = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
  }

  async startMonitoring(accountId) {
    this.monitorPayments(accountId);
    this.monitorOperations(accountId);
  }

  monitorPayments(accountId) {
    const closeHandler = this.server
      .payments()
      .forAccount(accountId)
      .cursor('now')
      .stream({
        onmessage: (payment) => this.handlePayment(payment, accountId),
        onerror: (error) => this.handleError(error, accountId),
      });
    this.closeHandlers.push(closeHandler);
  }

  monitorOperations(accountId) {
    const closeHandler = this.server
      .operations()
      .forAccount(accountId)
      .cursor('now')
      .stream({
        onmessage: (operation) => this.handleOperation(operation, accountId),
        onerror: (error) => this.handleError(error, accountId),
      });
    this.closeHandlers.push(closeHandler);
  }

  handlePayment(payment, accountId) {
    const event = {
      id: payment.id,
      type: BlockchainEventType.PAYMENT,
      timestamp: payment.created_at,
      account: accountId,
      data: {
        from: payment.from,
        to: payment.to,
        amount: payment.amount,
        asset: payment.asset_type === 'native' ? 'XLM' : payment.asset_code,
      },
    };
    this.emit(BlockchainEventType.PAYMENT, event);
  }

  handleOperation(operation, accountId) {
    const eventType = this.detectEventType(operation);
    if (!eventType) return;

    const event = {
      id: operation.id,
      type: eventType,
      timestamp: operation.created_at,
      account: accountId,
      data: this.extractOperationData(operation),
    };
    this.emit(eventType, event);
  }

  detectEventType(operation) {
    switch (operation.type) {
      case 'payment':
        return BlockchainEventType.PAYMENT;
      case 'path_payment_strict_receive':
      case 'path_payment_strict_send':
        return BlockchainEventType.TOKEN_TRANSFER;
      case 'create_account':
        return BlockchainEventType.ACCOUNT_CREATED;
      case 'change_trust':
        return BlockchainEventType.TRUSTLINE_CREATED;
      case 'invoke_host_function':
        return BlockchainEventType.CONTRACT_EXECUTION;
      default:
        return null;
    }
  }

  extractOperationData(operation) {
    const baseData = {
      type: operation.type,
      transactionHash: operation.transaction_hash,
    };

    switch (operation.type) {
      case 'payment':
        return {
          ...baseData,
          from: operation.from,
          to: operation.to,
          amount: operation.amount,
          asset: operation.asset_type === 'native' ? 'XLM' : operation.asset_code,
        };
      case 'create_account':
        return {
          ...baseData,
          account: operation.account,
          startingBalance: operation.starting_balance,
        };
      case 'change_trust':
        return {
          ...baseData,
          asset: operation.asset_code,
          limit: operation.limit,
        };
      case 'invoke_host_function':
        return {
          ...baseData,
          function: 'contract_execution',
        };
      default:
        return baseData;
    }
  }

  handleError(error, accountId) {
    console.error(`Event stream error for ${accountId}:`, error);
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.startMonitoring(accountId);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  emit(eventType, event) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach((callback) => callback(event));
    }
  }

  stopMonitoring() {
    this.closeHandlers.forEach((close) => close());
    this.closeHandlers = [];
    this.listeners.clear();
    this.reconnectAttempts = 0;
  }
}

class EventMonitorBridge {
  constructor(horizonUrl) {
    this.mainWindow = null;
    this.eventBatch = [];
    this.batchInterval = null;
    this.batchSize = 10;
    this.batchTimeout = 1000;
    this.eventMonitor = new EventMonitorService(horizonUrl);
    this.setupIpcHandlers();
  }

  setMainWindow(window) {
    this.mainWindow = window;
  }

  setupIpcHandlers() {
    ipcMain.handle('blockchain:start-monitoring', async (_, accountId) => {
      try {
        this.setupEventListeners();
        await this.eventMonitor.startMonitoring(accountId);
        this.startBatching();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    ipcMain.handle('blockchain:stop-monitoring', () => {
      try {
        this.eventMonitor.stopMonitoring();
        this.stopBatching();
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
  }

  setupEventListeners() {
    Object.values(BlockchainEventType).forEach((eventType) => {
      this.eventMonitor.on(eventType, (event) => {
        this.addEventToBatch(event);
      });
    });
  }

  addEventToBatch(event) {
    this.eventBatch.push(event);
    if (this.eventBatch.length >= this.batchSize) {
      this.flushBatch();
    }
  }

  startBatching() {
    if (this.batchInterval) return;
    this.batchInterval = setInterval(() => {
      if (this.eventBatch.length > 0) {
        this.flushBatch();
      }
    }, this.batchTimeout);
  }

  stopBatching() {
    if (this.batchInterval) {
      clearInterval(this.batchInterval);
      this.batchInterval = null;
    }
    this.flushBatch();
  }

  flushBatch() {
    if (!this.mainWindow || this.eventBatch.length === 0) return;
    try {
      this.mainWindow.webContents.send('blockchain:events', this.eventBatch);
      this.eventBatch = [];
    } catch (error) {
      console.error('Failed to send events to renderer:', error);
    }
  }

  cleanup() {
    this.eventMonitor.stopMonitoring();
    this.stopBatching();
    ipcMain.removeHandler('blockchain:start-monitoring');
    ipcMain.removeHandler('blockchain:stop-monitoring');
  }
}

module.exports = { EventMonitorBridge, BlockchainEventType };
