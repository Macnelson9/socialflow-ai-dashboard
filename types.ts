export enum View {
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  CALENDAR = 'CALENDAR',
  CREATE_POST = 'CREATE_POST',
  MEDIA_LIBRARY = 'MEDIA_LIBRARY',
  INBOX = 'INBOX',
  SETTINGS = 'SETTINGS'
}

export interface NavItem {
  id: View;
  label: string;
  icon: React.ReactNode;
}

export interface ViewProps {
  onNavigate: (view: View) => void;
}

export interface Post {
  id: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'linkedin' | 'x';
  content: string;
  image?: string;
  date: Date;
  status: 'scheduled' | 'published' | 'draft';
  stats?: {
    likes: number;
    views: number;
  };
}

export interface Message {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  platform: 'instagram' | 'facebook' | 'x';
  user: string;
  avatar: string;
  lastMessage: string;
  unread: boolean;
  status: 'new' | 'pending' | 'resolved';
  messages: Message[];
}

export enum Platform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  FACEBOOK = 'facebook',
  YOUTUBE = 'youtube',
  LINKEDIN = 'linkedin',
  X = 'x'
}

// Blockchain/Wallet Types
export interface WalletProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  installed: boolean;
  installUrl?: string;
}

export interface TokenBalance {
  code: string;
  issuer: string;
  balance: string;
}

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  provider: string | null;
  network: 'mainnet' | 'testnet';
  xlmBalance: string | null;
  tokenBalances: TokenBalance[];
  isLoading: boolean;
  error: string | null;
}

export enum WalletConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

// Notification Types
export enum NotificationType {
  PAYMENT = 'PAYMENT',
  TRANSFER = 'TRANSFER',
  CONTRACT = 'CONTRACT',
  BALANCE_CHANGE = 'BALANCE_CHANGE',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface NotificationTypeConfig {
  enabled: boolean;
  priority: NotificationPriority;
  sound: boolean;
  desktop: boolean;
  email: boolean;
}

export interface QuietHours {
  enabled: boolean;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  days: number[]; // 0-6 (Sunday-Saturday)
}

export interface NotificationPreferences {
  doNotDisturb: boolean;
  quietHours: QuietHours;
  types: {
    [NotificationType.PAYMENT]: NotificationTypeConfig;
    [NotificationType.TRANSFER]: NotificationTypeConfig;
    [NotificationType.CONTRACT]: NotificationTypeConfig;
    [NotificationType.BALANCE_CHANGE]: NotificationTypeConfig;
    [NotificationType.TRANSACTION_FAILED]: NotificationTypeConfig;
  };
}
