import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExportScale } from '../types';
import { UI_STORAGE_KEY, getConfigStorage } from '../lib/storage';

export type EditorTab = 'template' | 'contacts' | 'messages' | 'style';
export type EditorTheme = 'system' | 'light' | 'dark';
export type SheetSnap = 'collapsed' | 'half' | 'full';

interface UiState {
  editorTheme: EditorTheme;
  activeTab: EditorTab;
  sheetSnap: SheetSnap;
  exportScale: ExportScale;
  exportTransparent: boolean;
  hasSeenIntro: boolean;

  setEditorTheme: (theme: EditorTheme) => void;
  cycleEditorTheme: () => void;
  setActiveTab: (tab: EditorTab) => void;
  setSheetSnap: (snap: SheetSnap) => void;
  cycleSheetSnap: () => void;
  setExportScale: (scale: ExportScale) => void;
  setExportTransparent: (value: boolean) => void;
  dismissIntro: () => void;
}

const SNAP_ORDER: SheetSnap[] = ['collapsed', 'half', 'full'];

function nextSnap(current: SheetSnap): SheetSnap {
  const index = SNAP_ORDER.indexOf(current);
  const next = SNAP_ORDER[index + 1];
  return next ?? SNAP_ORDER[0] ?? 'collapsed';
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      editorTheme: 'system',
      activeTab: 'messages',
      sheetSnap: 'collapsed',
      exportScale: 3,
      exportTransparent: false,
      hasSeenIntro: false,

      setEditorTheme: (editorTheme) => set({ editorTheme }),
      cycleEditorTheme: () => {
        const { editorTheme } = get();
        const order: EditorTheme[] = ['light', 'dark', 'system'];
        const index = order.indexOf(editorTheme);
        const next = order[(index + 1) % order.length] ?? 'system';
        set({ editorTheme: next });
      },
      setActiveTab: (activeTab) => set({ activeTab }),
      setSheetSnap: (sheetSnap) => set({ sheetSnap }),
      cycleSheetSnap: () => set({ sheetSnap: nextSnap(get().sheetSnap) }),
      setExportScale: (exportScale) => set({ exportScale }),
      setExportTransparent: (exportTransparent) => set({ exportTransparent }),
      dismissIntro: () => set({ hasSeenIntro: true }),
    }),
    {
      name: UI_STORAGE_KEY,
      version: 1,
      storage: getConfigStorage<UiState>(),
      partialize: (state) =>
        ({
          editorTheme: state.editorTheme,
          activeTab: state.activeTab,
          sheetSnap: state.sheetSnap,
          exportScale: state.exportScale,
          exportTransparent: state.exportTransparent,
          hasSeenIntro: state.hasSeenIntro,
        }) as UiState,
    },
  ),
);