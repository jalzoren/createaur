import type {
  ChatConfig,
  Contact,
  Message,
  Reaction,
  ReactionEmoji,
  TemplateId,
  XTheme,
} from '../types';
import { DEFAULT_X_THEME, REACTION_EMOJIS, SCHEMA_VERSION, TEMPLATE_IDS } from '../types';
import { defaultConfig } from './defaults';
import { isValidHex } from './color';
import { isValidTime } from './time';

const MAX_MESSAGES = 500;
const MAX_AVATAR_BYTES = 400 * 1024;
const MAX_CONTACTS = 20;
export const DEFAULT_ID_LEN = 10;

interface ConfigShape {
  [key: string]: unknown;
}

function isRecord(value: unknown): value is ConfigShape {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isTemplateId(value: unknown): value is TemplateId {
  return typeof value === 'string' && (TEMPLATE_IDS as string[]).includes(value);
}

function isReactionEmoji(value: unknown): value is ReactionEmoji {
  return typeof value === 'string' && (REACTION_EMOJIS as string[]).includes(value);
}

function isXTheme(value: unknown): value is XTheme {
  return value === 'light' || value === 'dim' || value === 'dark';
}

export function validateContacts(v: unknown): { ok: boolean; contacts?: Contact[]; error?: string } {
  if (!Array.isArray(v) || v.length === 0) {
    return { ok: false, error: 'Contacts must be a non-empty array.' };
  }
  if (v.length > MAX_CONTACTS) {
    return { ok: false, error: `Too many contacts (max ${MAX_CONTACTS}).` };
  }

  const contacts: Contact[] = [];
  const ids = new Set<string>();
  let selfCount = 0;

  for (let i = 0; i < v.length; i++) {
    const raw = v[i];
    if (!isRecord(raw)) {
      return { ok: false, error: `Contact #${i + 1} is not an object.` };
    }
    const id = typeof raw.id === 'string' && raw.id ? raw.id : `c${i}`;
    if (ids.has(id)) return { ok: false, error: `Duplicate contact id "${id}".` };
    ids.add(id);

    const name = typeof raw.name === 'string' ? raw.name : 'Contact';
    const avatarUrl = typeof raw.avatarUrl === 'string' ? raw.avatarUrl : undefined;
    if (avatarUrl && avatarUrl.startsWith('data:') && avatarUrl.length > MAX_AVATAR_BYTES) {
      return { ok: false, error: `Avatar for "${name}" is too large (over 400 KB).` };
    }

    const isSelf = raw.isSelf === true;
    if (isSelf) selfCount += 1;

    const bubbleColor = typeof raw.bubbleColor === 'string' && isValidHex(raw.bubbleColor)
      ? raw.bubbleColor
      : undefined;

    contacts.push({
      id,
      name,
      avatarUrl,
      isSelf,
      isVerified: raw.isVerified === true || undefined,
      isOnline: raw.isOnline === true || undefined,
      bubbleColor,
      handle: typeof raw.handle === 'string' ? raw.handle : undefined,
    });
  }

  if (selfCount !== 1) {
    return { ok: false, error: 'Exactly one contact must be marked as "you".' };
  }

  return { ok: true, contacts };
}

export function validateMessages(
  v: unknown,
  contactIds: Set<string>,
): { ok: boolean; messages?: Message[]; error?: string } {
  if (!Array.isArray(v)) {
    return { ok: false, error: 'Messages must be an array.' };
  }
  if (v.length > MAX_MESSAGES) {
    return { ok: false, error: `Too many messages (max ${MAX_MESSAGES}).` };
  }

  const messages: Message[] = [];

  for (let i = 0; i < v.length; i++) {
    const raw = v[i];
    if (!isRecord(raw)) {
      return { ok: false, error: `Message #${i + 1} is not an object.` };
    }
    const contactId = typeof raw.contactId === 'string' ? raw.contactId : '';
    if (!contactIds.has(contactId)) {
      return { ok: false, error: `Message #${i + 1} refers to an unknown contact.` };
    }
    const reaction = validateReaction(raw.reaction, contactIds);

    messages.push({
      id: typeof raw.id === 'string' && raw.id ? raw.id : `m${i}`,
      contactId,
      text: typeof raw.text === 'string' ? raw.text : '',
      timestamp:
        typeof raw.timestamp === 'string' && isValidTime(raw.timestamp)
          ? raw.timestamp
          : undefined,
      reaction: reaction.ok ? reaction.reaction : undefined,
      isRead: raw.isRead === true || undefined,
      attachmentUrl: undefined,
    });
  }

  return { ok: true, messages };
}

function validateReaction(
  v: unknown,
  contactIds: Set<string>,
): { ok: boolean; reaction?: Reaction } {
  if (v === undefined || v === null) return { ok: true };
  if (!isRecord(v)) return { ok: false };
  if (!isReactionEmoji(v.emoji)) return { ok: false };
  const fromContactId = typeof v.fromContactId === 'string' ? v.fromContactId : '';
  if (!contactIds.has(fromContactId)) return { ok: false };
  return { ok: true, reaction: { emoji: v.emoji, fromContactId } };
}

export function validateConfig(json: unknown): {
  ok: true;
  config: ChatConfig;
} | {
  ok: false;
  error: string;
} {
  if (!isRecord(json)) {
    return { ok: false, error: 'Not a valid CreateAUR project.' };
  }
  if (json.app !== undefined && json.app !== 'createaur') {
    return { ok: false, error: 'Not a CreateAUR project file.' };
  }

  const template = isTemplateId(json.template)
    ? json.template
    : ((): TemplateId => 'imessage')();

  const contactCheck = validateContacts(json.contacts);
  if (!contactCheck.ok || !contactCheck.contacts) {
    return { ok: false, error: contactCheck.error ?? 'Invalid contacts.' };
  }
  const contacts = contactCheck.contacts;
  const contactIds = new Set(contacts.map((c) => c.id));

  const messageCheck = validateMessages(json.messages, contactIds);
  if (!messageCheck.ok || !messageCheck.messages) {
    return { ok: false, error: messageCheck.error ?? 'Invalid messages.' };
  }

  const base = defaultConfig();

  const batteryRaw = typeof json.battery === 'number' ? json.battery : base.battery;
  const battery = Math.min(100, Math.max(0, batteryRaw));
  const bubbleRaw =
    typeof json.bubbleOpacity === 'number' ? json.bubbleOpacity : base.bubbleOpacity;
  const bubbleOpacity = Math.min(1, Math.max(0.6, bubbleRaw));
  const signalRaw = typeof json.signalBars === 'number' ? json.signalBars : base.signalBars;
  const signalBars = (Math.min(4, Math.max(0, Math.round(signalRaw))) ||
    0) as 0 | 1 | 2 | 3 | 4;
  const wallpaper =
    typeof json.wallpaper === 'string' && json.wallpaper
      ? json.wallpaper
      : base.wallpaper;
  const time = typeof json.time === 'string' && isValidTime(json.time)
    ? json.time
    : base.time;

  return {
    ok: true,
    config: {
      template,
      contacts,
      messages: messageCheck.messages,
      chatTitle: typeof json.chatTitle === 'string' ? json.chatTitle : undefined,
      dateLabel:
        typeof json.dateLabel === 'string' && json.dateLabel
          ? json.dateLabel
          : base.dateLabel,
      darkMode: json.darkMode === true,
      wallpaper,
      xTheme: isXTheme(json.xTheme) ? json.xTheme : DEFAULT_X_THEME,
      time,
      battery,
      carrier: typeof json.carrier === 'string' ? json.carrier : base.carrier,
      signalBars,
      showStatusBar: json.showStatusBar !== false,
      showTimestamp: json.showTimestamp !== false,
      showAvatars: json.showAvatars === true,
      showReadReceipts: json.showReadReceipts === true,
      bubbleOpacity,
      roundedCorners: json.roundedCorners !== false,
    },
  };
}

/** Serialized shape written to disk / clipboard within the app. */
export interface ProjectFile {
  app: 'createaur';
  schemaVersion: number;
  config: ChatConfig;
}

export function serializeProject(config: ChatConfig): string {
  const file: ProjectFile = { app: 'createaur', schemaVersion: SCHEMA_VERSION, config };
  return JSON.stringify(file, null, 2);
}