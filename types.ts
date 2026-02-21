export enum View {
  DASHBOARD = 'DASHBOARD',
  ANALYTICS = 'ANALYTICS',
  CALENDAR = 'CALENDAR',
  CREATE_POST = 'CREATE_POST',
  MEDIA_LIBRARY = 'MEDIA_LIBRARY',
  INBOX = 'INBOX',
  NFT_MINTER = 'NFT_MINTER',
  CAMPAIGN_WIZARD = 'CAMPAIGN_WIZARD',
  CAMPAIGN_DASHBOARD = 'CAMPAIGN_DASHBOARD',
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

export enum CampaignType {
  ENGAGEMENT = 'engagement',
  REFERRAL = 'referral',
  MILESTONE = 'milestone'
}

export enum CampaignStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  DRAFT = 'draft'
}

export interface EngagementRules {
  likesThreshold?: number;
  sharesThreshold?: number;
  commentsThreshold?: number;
  rewardPerLike?: number;
  rewardPerShare?: number;
  rewardPerComment?: number;
}

export interface ReferralRules {
  rewardPerReferral: number;
  minimumReferrals?: number;
}

export interface MilestoneRules {
  followerCountTarget?: number;
  engagementRateTarget?: number;
  rewardAmount: number;
}

export interface CampaignRules {
  engagement?: EngagementRules;
  referral?: ReferralRules;
  milestone?: MilestoneRules;
  maxRewardsPerUser?: number;
}

export interface CampaignBudget {
  amount: number;
  asset: string;
  spent: number;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  budget: CampaignBudget;
  rules: CampaignRules;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  metrics?: {
    participants: number;
    rewardsDistributed: number;
    engagementCount: number;
  };
}
