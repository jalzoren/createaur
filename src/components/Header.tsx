import { Button, IconButton } from './ui';
import { ExportPopover } from './ExportPopover';
import { Logo } from './Logo';
import { LuCopy, LuDownload, LuMoon, LuSettings2, LuSun } from './ui/icons';
import { useUiStore } from '../store/useUiStore';
import { isClipboardSupported } from '../lib/export';
import styles from './Header.module.css';

export interface HeaderProps {
  onAbout: () => void;
  onExport: () => Promise<void>;
  onCopy: () => Promise<void>;
  exporting: boolean;
  copying: boolean;
}

export function Header({ onAbout, onExport, onCopy, exporting, copying }: HeaderProps) {
  const editorTheme = useUiStore((s) => s.editorTheme);
  const cycleEditorTheme = useUiStore((s) => s.cycleEditorTheme);
  const copySupported = isClipboardSupported();

  const themeIsDark = editorTheme === 'dark';
  const themeLabel = `Switch to ${themeIsDark ? 'light' : 'dark'} editor theme`;

  return (
    <header className={styles.root}>
      <button type="button" className={styles.wordmark} onClick={onAbout} aria-label="About CreateAUR">
        <Logo size={22} />
        <span>createaur</span>
      </button>

      <div className={styles.actions}>
        <IconButton
          icon={themeIsDark ? <LuSun size={16} /> : <LuMoon size={16} />}
          aria-label={themeLabel}
          onClick={cycleEditorTheme}
        />
        <Button
          variant="outline"
          size="sm"
          leftIcon={<LuCopy size={16} />}
          onClick={onCopy}
          disabled={!copySupported || copying}
          loading={copying}
          title={
            !copySupported
              ? "Copy isn't supported in this browser — use Export PNG."
              : undefined
          }
        >
          <span className={styles.copyLabel}>Copy</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<LuDownload size={16} />}
          onClick={onExport}
          disabled={exporting}
          loading={exporting}
        >
          Export PNG
        </Button>
        <ExportPopover
          onExport={onExport}
          onCopy={onCopy}
          exporting={exporting}
          copying={copying}
          trigger={
            <IconButton
              icon={<LuSettings2 size={16} />}
              aria-label="Export options"
              variant="outline"
            />
          }
        />
      </div>
    </header>
  );
}