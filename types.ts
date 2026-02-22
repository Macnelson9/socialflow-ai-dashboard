export enum View {
  DASHBOARD = "DASHBOARD",
  ANALYTICS = "ANALYTICS",
  CALENDAR = "CALENDAR",
  CREATE_POST = "CREATE_POST",
  MEDIA_LIBRARY = "MEDIA_LIBRARY",
  INBOX = "INBOX",
  SETTINGS = "SETTINGS",
  NFT_GALLERY = "NFT_GALLERY",
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
  platform: "instagram" | "tiktok" | "facebook" | "youtube" | "linkedin" | "x";
  content: string;
  image?: string;
  date: Date;
  status: "scheduled" | "published" | "draft";
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
  platform: "instagram" | "facebook" | "x";
  user: string;
  avatar: string;
  lastMessage: string;
  unread: boolean;
  status: "new" | "pending" | "resolved";
  messages: Message[];
}

export enum Platform {
  INSTAGRAM = "instagram",
  TIKTOK = "tiktok",
  FACEBOOK = "facebook",
  YOUTUBE = "youtube",
  LINKEDIN = "linkedin",
  X = "x",
}

// NFT Types
export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: NFTAttribute[];
}

export interface NFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  title: string;
  description: string;
  image: string;
  imageThumbnail: string;
  externalUrl?: string;
  attributes: NFTAttribute[];
  collection: string;
  collectionImage?: string;
  owner: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  ipfsImage?: string;
}

export interface NFTTransfer {
  id: string;
  from: string;
  to: string;
  timestamp: string;
  transactionHash: string;
  price?: string;
}

export type NFTSortOption =
  | "date_desc"
  | "date_asc"
  | "name_asc"
  | "name_desc"
  | "collection";

export interface NFTFilterState {
  collection: string | null;
  searchQuery: string;
  dateFrom: string | null;
  dateTo: string | null;
  sortBy: NFTSortOption;
}
