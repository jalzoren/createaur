import { useMemo } from 'react';
import type { ChatConfig, Contact } from '../../../types';
import { groupMessages } from '../../../lib/groupMessages';
import type { MessageGroup } from '../../../lib/groupMessages';
import { resolveWallpaper } from '../../../lib/wallpapers';

export interface TemplateData {
  self: Contact;
  others: Contact[];
  isGroup: boolean;
  groups: MessageGroup[];
  title: string;
  subtitle: string | undefined;
  lastSelfMessageId: string | undefined;
  wallpaper: string;
  firstOther: Contact | undefined;
}

function derive(config: ChatConfig): TemplateData {
  const self = config.contacts.find((c) => c.isSelf) ?? config.contacts[0]!;
  const others = config.contacts.filter((c) => !c.isSelf);
  const isGroup = config.contacts.length > 2;
  const groups = groupMessages(config.messages, {
    time: config.time,
    dateLabel: config.dateLabel,
    showTimestamp: config.showTimestamp,
    selfId: self?.id ?? '',
  });
  const onlineOther = others.find((c) => c.isOnline);

  const names = others
    .map((c) => c.name.split(' ')[0])
    .filter(Boolean)
    .join(', ');
  const title = config.chatTitle && config.chatTitle.trim() ? config.chatTitle : names;
  const subtitle = isGroup
    ? `${config.contacts.length} people`
    : onlineOther
      ? 'Active now'
      : others[0]?.handle;

  const lastSelfMessageId = [...config.messages]
    .reverse()
    .find((m) => m.contactId === self?.id)?.id;

  return {
    self,
    others,
    isGroup,
    groups,
    title,
    subtitle,
    lastSelfMessageId,
    wallpaper: resolveWallpaper(config.wallpaper, config.darkMode),
    firstOther: others[0],
  };
}

/** Memoized derivation of everything a template needs from the config. */
export function useTemplateData(config: ChatConfig): TemplateData {
  return useMemo(() => derive(config), [config]);
}

/** Plain derivation, exported for testability. */
export function deriveTemplateData(config: ChatConfig): TemplateData {
  return derive(config);
}