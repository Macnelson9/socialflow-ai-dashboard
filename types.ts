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

// Payment & Blockchain Types
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  icon?: string;
}

export interface PaymentFormData {
  recipientAddress: string;
  amount: string;
  assetId: string;
  memo?: string;
}

export interface PaymentSummary {
  recipientAddress: string;
  amount: string;
  asset: Asset;
  estimatedGasFee: string;
  totalCost: string;
  memo?: string;
}

export interface TransactionStatus {
  id: string;
  hash: string;
  status: 'pending' | 'success' | 'error';
  timestamp: Date;
  amount: string;
  asset: Asset;
  recipientAddress: string;
  errorMessage?: string;
}

export interface PaymentRequest {
  id: string;
  recipientAddress: string;
  amount: string;
  asset: Asset;
  memo?: string;
  qrCode: string;
  shareableLink: string;
  createdAt: Date;
}

export interface RecurringPayment {
  id: string;
  recipientAddress: string;
  amount: string;
  asset: Asset;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: Date;
  endDate?: Date;
  nextPaymentDate: Date;
  isActive: boolean;
  memo?: string;
}
