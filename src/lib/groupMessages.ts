import type { Message } from '../types';
import { parseTimeMinutes } from './time';

export interface GroupedMessage {
  message: Message;
  isFirst: boolean;
  isLast: boolean;
}

export interface MessageGroup {
  contactId: string;
  isSelf: boolean;
  timeLabel?: string; // shown above the group when a time bucket changed
  messages: GroupedMessage[];
}

export interface GroupOptions {
  time: string; // status-bar fallback time 'HH:MM'
  dateLabel: string;
  showTimestamp: boolean;
  selfId: string; // id of the self contact, to derive isSelf
}

const GAP_MINUTES = 5;

/**
 * Consecutive messages from the same sender within the same time bucket form a
 * group. A new group starts when the sender changes or the resolved minute of
 * day differs by >= 5 minutes from the previous message.
 *
 * Resolved timestamp: `message.timestamp` if set, otherwise the previous
 * message's resolved timestamp (the first message inherits `config.time`).
 */
export function groupMessages(messages: Message[], opts: GroupOptions): MessageGroup[] {
  if (messages.length === 0) return [];

  const groups: MessageGroup[] = [];
  let lastResolvedMinutes = -1;
  let lastContactId: string | undefined;

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    if (!message) continue;

    const resolved = message.timestamp ?? projectResolved(messages, i, opts.time);
    const resolvedMinutes = parseTimeMinutes(resolved);
    const bucketChanged =
      lastContactId !== undefined &&
      lastResolvedMinutes >= 0 &&
      resolvedMinutes >= 0 &&
      resolvedMinutes - lastResolvedMinutes >= GAP_MINUTES;
    const senderChanged = lastContactId !== undefined && lastContactId !== message.contactId;

    if (lastContactId === undefined || senderChanged || bucketChanged) {
      groups.push({
        contactId: message.contactId,
        isSelf: message.contactId === opts.selfId,
        messages: [],
      });
    }

    const group = groups[groups.length - 1];
    if (!group) continue;
    group.messages.push({ message, isFirst: false, isLast: false });

    const isFirstGroup = groups.length === 1;
    const showLabel = opts.showTimestamp && (bucketChanged || isFirstGroup);
    if (showLabel && resolvedMinutes >= 0) {
      group.timeLabel = isFirstGroup ? `${opts.dateLabel} ${resolved}` : resolved;
    }

    lastResolvedMinutes = resolvedMinutes;
    lastContactId = message.contactId;
  }

  for (const group of groups) {
    const lastIdx = group.messages.length - 1;
    for (let i = 0; i <= lastIdx; i++) {
      const item = group.messages[i];
      if (!item) continue;
      item.isFirst = i === 0;
      item.isLast = i === lastIdx;
    }
  }

  return groups;
}

/**
 * Resolve the timestamp for a message: its own `timestamp`, else the nearest
 * preceding message's `timestamp`, else the fallback status-bar `time`.
 */
function projectResolved(messages: Message[], index: number, fallback: string): string {
  for (let i = index; i >= 0; i--) {
    const m = messages[i];
    if (m?.timestamp) return m.timestamp;
  }
  return fallback;
}