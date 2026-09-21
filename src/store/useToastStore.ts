import { create } from 'zustand';

export type ToastKind = 'info' | 'error';

interface ToastState {
  message: string | null;
  kind: ToastKind;
  showToast: (message: string, kind?: ToastKind) => void;
  dismiss: () => void;
}

const AUTO_DISMISS_MS = 4000;

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>()((set) => ({
  message: null,
  kind: 'info',
  showToast: (message, kind = 'info') => {
    if (timer) clearTimeout(timer);
    set({ message, kind });
    timer = setTimeout(() => set({ message: null }), AUTO_DISMISS_MS);
  },
  dismiss: () => {
    if (timer) clearTimeout(timer);
    set({ message: null });
  },
}));