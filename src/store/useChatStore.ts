import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PersistOptions } from 'zustand/middleware';
import type { ChatConfig, Contact, Message, TemplateId } from '../types';
import { SCHEMA_VERSION, TEMPLATE_DEFAULTS } from '../types';
import { defaultConfig, freshContact, freshMessage } from '../lib/defaults';
import { migrate } from '../lib/migrate';
import { isValidTime, normalizeTime } from '../lib/time';
import { isValidHex, expandHex } from '../lib/color';
import { validateConfig } from '../lib/validate';
import { CONFIG_STORAGE_KEY, getConfigStorage } from '../lib/storage';
import { useToastStore } from './useToastStore';

type ImportResult = { ok: true } | { ok: false; error: string };

export interface ChatActions {
  addContact: () => string;
  updateContact: (id: string, patch: Partial<Omit<Contact, 'id'>>) => void;
  setSelf: (id: string) => void;
  removeContact: (id: string) => void;

  addMessage: (afterId?: string) => string;
  updateMessage: (id: string, patch: Partial<Omit<Message, 'id'>>) => void;
  removeMessage: (id: string) => void;
  moveMessage: (id: string, direction: 'up' | 'down') => void;
  clearMessages: () => void;

  setTemplate: (t: TemplateId) => void;
  updateConfig: (patch: Partial<ChatConfig>) => void;

  reset: () => void;
  importConfig: (json: unknown) => ImportResult;
  exportConfig: () => ChatConfig;
}

export type ChatStore = ChatConfig & ChatActions & {
  customized: { darkMode: boolean; wallpaper: boolean; xTheme: boolean };
};

const AVATAR_PALETTE = [
  '#8E8E93',
  '#FF9500',
  '#FF2D55',
  '#FF3B30',
  '#5AC8FA',
  '#007AFF',
  '#34C759',
  '#AF52DE',
  '#FFCC00',
  '#00C7BE',
];

function clampNumber(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function nextPaletteColor(count: number): string {
  return AVATAR_PALETTE[count % AVATAR_PALETTE.length] ?? '#8E8E93';
}

function oppositeSender(state: ChatConfig, previousId: string | undefined): string {
  if (previousId) {
    const self = state.contacts.find((c) => c.isSelf);
    const prev = state.contacts.find((c) => c.id === previousId);
    if (prev?.isSelf) {
      return state.contacts.find((c) => !c.isSelf)?.id ?? (self?.id ?? '');
    }
    return self?.id ?? '';
  }
  return state.contacts.find((c) => c.isSelf)?.id ?? '';
}

function buildState(): ChatConfig {
  return defaultConfig();
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...buildState(),
      customized: { darkMode: false, wallpaper: false, xTheme: false },

      addContact: () => {
        const state = get();
        const palette = nextPaletteColor(state.contacts.length);
        const contact = freshContact({
          name: `Contact ${state.contacts.length + 1}`,
          bubbleColor: palette,
        });
        set({ contacts: [...state.contacts, contact] });
        return contact.id;
      },

      updateContact: (id, patch) => {
        set({
          contacts: get().contacts.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...patch,
                  bubbleColor:
                    patch.bubbleColor !== undefined && isValidHex(patch.bubbleColor)
                      ? expandHex(patch.bubbleColor)
                      : c.bubbleColor,
                }
              : c,
          ),
        });
      },

      setSelf: (id) => {
        set({
          contacts: get().contacts.map((c) => ({ ...c, isSelf: c.id === id })),
        });
      },

      removeContact: (id) => {
        const state = get();
        const contact = state.contacts.find((c) => c.id === id);
        if (!contact || contact.isSelf || state.contacts.length <= 1) return;
        const selfId = state.contacts.find((c) => c.isSelf)?.id ?? '';
        const contacts = state.contacts.filter((c) => c.id !== id);
        const messages = state.messages.map((m) =>
          m.contactId === id
            ? { ...m, contactId: selfId }
            : m.reaction?.fromContactId === id
              ? { ...m, reaction: { ...m.reaction, fromContactId: selfId } }
              : m,
        );
        set({ contacts, messages });
      },

      addMessage: (afterId) => {
        const state = get();
        const index = afterId ? state.messages.findIndex((m) => m.id === afterId) : -1;
        const previous = index >= 0 ? state.messages[index] : state.messages[state.messages.length - 1];
        const sender = oppositeSender(state, previous?.id);
        const message = freshMessage({ contactId: sender, isRead: false });
        const messages = [...state.messages];
        messages.splice(index + 1, 0, message);
        set({ messages });
        return message.id;
      },

      updateMessage: (id, patch) => {
        set({
          messages: get().messages.map((m) => {
            if (m.id !== id) return m;
            const next = { ...m, ...patch };
            if (next.timestamp !== undefined) {
              const normalized = normalizeTime(next.timestamp);
              next.timestamp = isValidTime(next.timestamp) ? normalized : undefined;
            }
            if (patch.text !== undefined) next.text = patch.text.slice(0, 1000);
            return next;
          }),
        });
      },

      removeMessage: (id) => {
        set({ messages: get().messages.filter((m) => m.id !== id) });
      },

      moveMessage: (id, direction) => {
        const messages = [...get().messages];
        const index = messages.findIndex((m) => m.id === id);
        if (index < 0) return;
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= messages.length) return;
        const a = messages[index];
        const b = messages[target];
        if (!a || !b) return;
        messages[index] = b;
        messages[target] = a;
        set({ messages });
      },

      clearMessages: () => set({ messages: [] }),

      setTemplate: (template) => {
        const state = get();
        const defaults = TEMPLATE_DEFAULTS[template];
        const patch: Partial<ChatConfig> = { template };
        if (!state.customized.darkMode) patch.darkMode = defaults.darkMode;
        if (!state.customized.wallpaper) patch.wallpaper = defaults.wallpaper;
        if (!state.customized.xTheme && defaults.xTheme !== undefined) {
          patch.xTheme = defaults.xTheme;
        }
        set(patch);
      },

      updateConfig: (patch) => {
        const next: Partial<ChatConfig> = { ...patch };
        if (next.battery !== undefined) {
          next.battery = Math.round(clampNumber(next.battery, 0, 100));
        }
        if (next.bubbleOpacity !== undefined) {
          next.bubbleOpacity = clampNumber(next.bubbleOpacity, 0.6, 1);
        }
        if (next.signalBars !== undefined) {
          next.signalBars = Math.round(clampNumber(next.signalBars, 0, 4)) as 0 | 1 | 2 | 3 | 4;
        }
        if (next.time !== undefined) {
          next.time = isValidTime(next.time) ? next.time : get().time;
        }
        const customized = { ...get().customized };
        if (patch.darkMode !== undefined) customized.darkMode = true;
        if (patch.wallpaper !== undefined) customized.wallpaper = true;
        if (patch.xTheme !== undefined) customized.xTheme = true;
        set({ ...next, customized });
      },

      reset: () => {
        set({ ...buildState(), customized: { darkMode: false, wallpaper: false, xTheme: false } });
      },

      importConfig: (json) => {
        const payload = unwrapProjectFile(json);
        const check = validateConfig(payload);
        if (!check.ok) return { ok: false, error: check.error };
        set({
          ...check.config,
          customized: { darkMode: false, wallpaper: false, xTheme: false },
        });
        return { ok: true };
      },

      exportConfig: () => pickConfig(get()),
    }),
    {
      name: CONFIG_STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: getConfigStorage<ChatConfig>(),
      partialize: (state) => pickConfig(state),
      migrate: ((persisted: unknown, version: number) =>
        migrate(persisted, version)) as unknown as PersistOptions<ChatStore, ChatConfig>['migrate'],
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        if (state && !getConfigStorage<ChatConfig>().isAvailable()) {
          useToastStore.getState().showToast(
            'Autosave is unavailable in this browser session.',
          );
        }
      },
    },
  ),
);

function pickConfig(state: ChatStore): ChatConfig {
  const {
    template,
    contacts,
    messages,
    chatTitle,
    dateLabel,
    darkMode,
    wallpaper,
    xTheme,
    time,
    battery,
    carrier,
    signalBars,
    showStatusBar,
    showTimestamp,
    showAvatars,
    showReadReceipts,
    bubbleOpacity,
    roundedCorners,
  } = state;
  return {
    template,
    contacts,
    messages,
    chatTitle,
    dateLabel,
    darkMode,
    wallpaper,
    xTheme,
    time,
    battery,
    carrier,
    signalBars,
    showStatusBar,
    showTimestamp,
    showAvatars,
    showReadReceipts,
    bubbleOpacity,
    roundedCorners,
  };
}

function unwrapProjectFile(json: unknown): unknown {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    const record = json as Record<string, unknown>;
    if (record.app === 'createaur' && record.config !== undefined) return record.config;
    if (record.schemaVersion !== undefined && record.config !== undefined) {
      return record.config;
    }
  }
  return json;
}

// Cross-tab sync notice.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === CONFIG_STORAGE_KEY && event.newValue !== null) {
      useToastStore.getState().showToast('Changed in another tab — reload to sync.');
    }
  });
}