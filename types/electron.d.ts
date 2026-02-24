export interface ElectronAPI {
  sendMessage: (channel: string, data: any) => void;
  sendNotification: (data: {
    title: string;
    body: string;
    severity?: 'warning' | 'critical';
  }) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
