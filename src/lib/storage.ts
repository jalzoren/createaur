import type { PersistStorage, StorageValue } from 'zustand/middleware';

export const CONFIG_STORAGE_KEY = 'createaur:config:v1';
export const UI_STORAGE_KEY = 'createaur:ui:v1';

export const DEBOUNCE_MS = 200;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

const memory = new Map<string, string>();

function memoryStorage(): StorageLike {
  return {
    getItem: (key) => memory.get(key) ?? null,
    setItem: (key, value) => {
      memory.set(key, value);
    },
    removeItem: (key) => {
      memory.delete(key);
    },
  };
}

/** Returns real localStorage when usable, else an in-memory fallback. */
function pickStorage(): StorageLike {
  try {
    const ls = window.localStorage;
    const probe = '__createaur_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return ls;
  } catch {
    return memoryStorage();
  }
}

export interface DebouncedStorageHandles {
  flush: () => void;
  isAvailable: () => boolean;
}

/**
 * A zustand PersistStorage backed by localStorage with debounced writes.
 * Writes are coalesced for `delayMs`; `flush()` writes everything pending
 * immediately (called on visibilitychange/pagehide so nothing is lost).
 *
 * When localStorage is blocked (private mode, quota), it falls back to memory
 * and reports `isAvailable() === false` so the app can show a one-time toast.
 */
export function createDebouncedStorage<T>(
  _name: string,
  delayMs: number = DEBOUNCE_MS,
): PersistStorage<T> & DebouncedStorageHandles {
  const backing = pickStorage();
  const pending = new Map<string, string>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  let available = true;

  function write(key: string, serialized: string): void {
    timers.delete(key);
    if (!available) {
      pending.set(key, serialized); // keep in memory at least
      return;
    }
    try {
      backing.setItem(key, serialized);
      pending.delete(key);
    } catch {
      available = false;
      backing.setItem(key, serialized);
      pending.delete(key);
    }
  }

  return {
    getItem: (key) => {
      const cached = pending.get(key);
      const serialized = cached !== undefined ? cached : backing.getItem(key);
      if (serialized === null) return null;
      try {
        return JSON.parse(serialized) as StorageValue<T>;
      } catch {
        return null;
      }
    },
    setItem: (key, value) => {
      const serialized = JSON.stringify(value);
      pending.set(key, serialized);
      const existing = timers.get(key);
      if (existing) clearTimeout(existing);
      timers.set(
        key,
        setTimeout(() => write(key, serialized), delayMs),
      );
    },
    removeItem: (key) => {
      pending.delete(key);
      const existing = timers.get(key);
      if (existing) clearTimeout(existing);
      backing.removeItem?.(key);
    },
    flush: () => {
      for (const [key, serialized] of pending) {
        clearTimeout(timers.get(key));
        timers.delete(key);
        write(key, serialized);
      }
    },
    isAvailable: () => available,
  };
}

let configHandle: DebouncedStorageHandles | undefined;

export function getConfigStorage<T>(): PersistStorage<T> & DebouncedStorageHandles {
  if (!configHandle) configHandle = createDebouncedStorage<T>(CONFIG_STORAGE_KEY);
  return configHandle as PersistStorage<T> & DebouncedStorageHandles;
}

/** Flush any pending debounced writes (call on pagehide / visibility hidden). */
export function flushPendingWrites(): void {
  configHandle?.flush();
}

/** Register visibilitychange/pagehide listeners that guarantee no data loss. */
export function installFlushListeners(): void {
  const flush = (): void => flushPendingWrites();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
}

