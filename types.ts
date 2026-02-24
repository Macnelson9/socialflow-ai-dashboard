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
  // Blockchain promotion fields
  isSponsored?: boolean;
  sponsorshipTier?: 'basic' | 'premium' | 'enterprise';
  sponsorshipAmount?: number;
  transactionHash?: string;
  promotionBudget?: number;
  promotionStatus?: 'pending' | 'active' | 'completed' | 'failed';
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

// Blockchain payment types
export interface WalletConnection {
  isConnected: boolean;
  publicKey?: string;
  balance?: number;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed';
  transactionHash?: string;
  timestamp: Date;
  postId: string;
  sponsorshipTier: 'basic' | 'premium' | 'enterprise';
}

export interface SponsorshipTier {
  id: 'basic' | 'premium' | 'enterprise';
  name: string;
  price: number;
  features: string[];
  duration: number; // hours
  reach: string;
}