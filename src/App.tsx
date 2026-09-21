import { useCallback, useEffect, useState } from 'react';
import { useChatStore } from './store/useChatStore';
import { useUiStore } from './store/useUiStore';
import { useToastStore } from './store/useToastStore';
import { useMediaQuery } from './hooks/useMediaQuery';
import { exportPng, copyChatPng } from './lib/export';
import type { ExportOptions } from './lib/export';
import { Header } from './components/Header';
import { Sidebar } from './components/editor/Sidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { AboutModal } from './components/AboutModal';
import { Toast } from './components/ui';
import { LuPen, LuX } from './components/ui/icons';
import styles from './App.module.css';

function useEditorTheme(): void {
  const editorTheme = useUiStore((s) => s.editorTheme);
  useEffect(() => {
    const root = document.documentElement;
    const resolved = editorTheme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : editorTheme;
    if (resolved === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
  }, [editorTheme]);
}

export default function App() {
  useEditorTheme();

  const template = useChatStore((s) => s.template);
  const [exporting, setExporting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const exportNow = useCallback(async (): Promise<void> => {
    const { exportScale, exportTransparent } = useUiStore.getState();
    setExporting(true);
    try {
      const opts: ExportOptions = {
        pixelRatio: exportScale,
        transparentCorners: exportTransparent,
      };
      const result = await exportPng(opts, template);
      useToastStore.getState().showToast(`Saved ${result.filename} (${result.ratio}×)`);
    } catch {
      useToastStore.getState().showToast('Export failed. Try a smaller size.', 'error');
    } finally {
      setExporting(false);
    }
  }, [template]);

  const copyNow = useCallback(async (): Promise<void> => {
    const { exportScale, exportTransparent } = useUiStore.getState();
    setCopying(true);
    try {
      await copyChatPng({ pixelRatio: exportScale, transparentCorners: exportTransparent });
      useToastStore.getState().showToast('Copied PNG to clipboard.');
    } catch {
      useToastStore.getState().showToast("Couldn't copy here — use Export PNG instead.", 'error');
    } finally {
      setCopying(false);
    }
  }, []);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent): void => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && (e.key === 'e' || e.key === 'E')) {
        e.preventDefault();
        void exportNow();
      } else if (mod && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        void copyNow();
      } else if (e.key === '?') {
        const target = e.target as HTMLElement | null;
        const editing =
          !!target &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable || target.tagName === 'SELECT');
        if (!editing) setAboutOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [exportNow, copyNow]);

  const isTabletUp = useMediaQuery('(min-width: 1024px)');
  const sheetSnap = useUiStore((s) => s.sheetSnap);
  const showMobileEdit = !isTabletUp && sheetSnap === 'collapsed';

  return (
    <div className={styles.app}>
      <Header
        onAbout={() => setAboutOpen(true)}
        onExport={exportNow}
        onCopy={copyNow}
        exporting={exporting}
        copying={copying}
      />

      <div className={styles.body}>
        <div className={styles.sidebarCol}>
          <Sidebar />
        </div>

        <main className={styles.main}>
          <IntroBanner />
          <div className={styles.previewWrap}>
            <PreviewCanvas />
          </div>
          <p className={styles.footnote}>
            Phone is 390px, scaled to fit your window — it never overflows. Exports keep the
            original pixels at 1×–3×, so a small preview still saves crisp.
          </p>
        </main>
      </div>

      {showMobileEdit && (
        <button
          type="button"
          className={styles.mobileEdit}
          onClick={() => useUiStore.getState().setSheetSnap('half')}
        >
          <LuPen size={16} aria-hidden="true" />
          Edit
        </button>
      )}

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <Toast />
    </div>
  );
}

function IntroBanner() {
  const hasSeenIntro = useUiStore((s) => s.hasSeenIntro);
  const dismissIntro = useUiStore((s) => s.dismissIntro);
  if (hasSeenIntro) return null;
  return (
    <div className={styles.intro} role="note">
      <p>
        <strong>Make a fake screenshot.</strong> Pick a template, add contacts, then type messages
        on the left. Everything below is a live preview.
      </p>
      <button
        type="button"
        className={styles.introClose}
        aria-label="Dismiss intro"
        onClick={dismissIntro}
      >
        <LuX size={14} aria-hidden="true" />
      </button>
    </div>
  );
}