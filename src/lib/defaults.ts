import { nanoid } from 'nanoid';
import type { ChatConfig, Contact, Message } from '../types';

export function freshContact(overrides: Partial<Contact> = {}): Contact {
  return {
    id: nanoid(10),
    name: 'Contact',
    isSelf: false,
    ...overrides,
  };
}

export function freshMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: nanoid(10),
    contactId: '',
    text: '',
    ...overrides,
  };
}

export function freshId(): string {
  return nanoid(10);
}

export function defaultConfig(): ChatConfig {
  const alexId = freshId();
  const youId = freshId();

  const contacts: Contact[] = [
    {
      id: alexId,
      name: 'Alex',
      isSelf: false,
      isOnline: true,
      isVerified: false,
      handle: '@alex',
    },
    {
      id: youId,
      name: 'You',
      isSelf: true,
      isVerified: false,
      handle: '@you',
    },
  ];

  const messages: Message[] = [
    {
      id: freshId(),
      contactId: alexId,
      text: 'Are you awake?',
      timestamp: '14:30',
    },
    {
      id: freshId(),
      contactId: youId,
      text: 'Barely. Why, what happened?',
      timestamp: '14:30',
    },
    {
      id: freshId(),
      contactId: alexId,
      text: "Remember that thing I said I'd never do?",
      timestamp: '14:31',
      reaction: { emoji: '❤️', fromContactId: youId },
    },
    {
      id: freshId(),
      contactId: youId,
      text: 'Alex. No.',
      timestamp: '14:32',
      isRead: true,
    },
  ];

  return {
    template: 'imessage',
    contacts,
    messages,
    chatTitle: undefined,
    dateLabel: 'Today',
    darkMode: false,
    wallpaper: 'ios-gray',
    xTheme: 'dim',
    time: '14:32',
    battery: 87,
    carrier: 'T-Mobile',
    signalBars: 4,
    showStatusBar: true,
    showTimestamp: true,
    showAvatars: true,
    showReadReceipts: true,
    bubbleOpacity: 1,
    roundedCorners: true,
  };
}