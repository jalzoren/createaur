export type TemplateId = 'imessage' | 'messenger' | 'twitter' | 'twitter-post' | 'facebook-post';

export const TEMPLATE_IDS: TemplateId[] = [
  'imessage',
  'messenger',
  'twitter',
  'twitter-post',
  'facebook-post',
];

export const SCHEMA_VERSION = 1;

export const MAX_CONTACTS = 8;

export type XTheme = 'light' | 'dim' | 'dark';

export const X_THEMES: XTheme[] = ['light', 'dim', 'dark'];

export const DEFAULT_X_THEME: XTheme = 'dim';

export type ReactionEmoji = '❤️' | '👍' | '😂' | '😮' | '😢' | '🔥';

export const REACTION_EMOJIS: ReactionEmoji[] = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

export interface Contact {
  id: string;
  name: string;
  avatarUrl?: string; // data URL (resized to <=256px) or remote URL
  isSelf: boolean; // exactly ONE contact must be self at all times
  isVerified?: boolean; // blue check (Twitter/X, Messenger)
  isOnline?: boolean; // green dot on avatar / "Active now" subtitle
  bubbleColor?: string; // hex; incoming-bubble tint in group chats
  handle?: string; // '@alex' — Twitter/X subtitle
}

export interface Reaction {
  emoji: ReactionEmoji;
  fromContactId: string;
}

export interface Message {
  id: string;
  contactId: string; // sender
  text: string; // may be empty only if attachmentUrl exists (v2)
  timestamp?: string; // 'HH:MM' 24h override
  reaction?: Reaction;
  isRead?: boolean; // only meaningful on self messages
  attachmentUrl?: string; // reserved for v2; not rendered in v1
}

export interface ChatConfig {
  template: TemplateId;
  contacts: Contact[];
  messages: Message[];

  // chat meta
  chatTitle?: string; // group name override; falls back to joined names
  dateLabel: string; // 'Today' | 'Yesterday' | 'Tue, Sep 21' etc.

  // preview style
  darkMode: boolean;
  wallpaper: string; // preset key ('ios-gray') or CSS color/gradient value
  xTheme: XTheme; // X (Twitter) composer theme: 'light' | 'dim' | 'dark'
  time: string; // status bar time 'HH:MM'
  battery: number; // 0-100
  carrier: string; // 'T-Mobile'
  signalBars: 0 | 1 | 2 | 3 | 4;
  showStatusBar: boolean;
  showTimestamp: boolean;
  showAvatars: boolean; // group chats only
  showReadReceipts: boolean;
  bubbleOpacity: number; // 0.6-1.0
  roundedCorners: boolean; // export/preview screen corners (44px radius vs 0)
}

export type ExportScale = 1 | 2 | 3;

export interface TemplateDefaults {
  darkMode: boolean;
  wallpaper: string;
  xTheme?: XTheme;
}

export const TEMPLATE_DEFAULTS: Record<TemplateId, TemplateDefaults> = {
  imessage: { darkMode: false, wallpaper: 'ios-gray' },
  messenger: { darkMode: false, wallpaper: 'white' },
  twitter: { darkMode: true, wallpaper: '#000000' },
  'twitter-post': { darkMode: true, wallpaper: '#000000', xTheme: 'dim' },
  'facebook-post': { darkMode: false, wallpaper: 'white' },
};