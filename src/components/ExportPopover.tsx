import { useState } from 'react';
import type { ReactNode } from 'react';
import { useUiStore } from '../store/useUiStore';
import type { ExportScale } from '../types';
import { Button, Popover, Toggle } from './ui';
import { LuCopy, LuDownload } from './ui/icons';
import styles from './ExportPopover.module.css';

export interface ExportPopoverProps {
  onExport: () => Promise<void>;
  onCopy: () => Promise<void>;
  exporting: boolean;
  copying: boolean;
  trigger: ReactNode;
}

const SCALE_OPTIONS: { value: ExportScale; label: string; note: string }[] = [
  { value: 1, label: '1×', note: 'Phone sized' },
  { value: 2, label: '2×', note: 'Retina' },
  { value: 3, label: '3×', note: 'Crisp' },
];

export function ExportPopover({ onExport, onCopy, exporting, copying, trigger }: ExportPopoverProps) {
  const exportScale = useUiStore((s) => s.exportScale);
  const exportTransparent = useUiStore((s) => s.exportTransparent);
  const setExportScale = useUiStore((s) => s.setExportScale);
  const setExportTransparent = useUiStore((s) => s.setExportTransparent);
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen} align="end" trigger={trigger}>
      <div className={styles.body}>
        <p className={styles.title}>Export size</p>
        <div className={styles.scales}>
          {SCALE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={styles.scale}
              data-selected={exportScale === opt.value ? 'true' : undefined}
              aria-pressed={exportScale === opt.value}
              onClick={() => setExportScale(opt.value)}
            >
              <span className={styles.scaleValue}>{opt.label}</span>
              <span className={styles.scaleNote}>{opt.note}</span>
            </button>
          ))}
        </div>
        <p className={styles.hint}>Tall chats may export at a lower scale to fit memory.</p>

        <div className={styles.toggleRow}>
          <Toggle
            id="expo-transparent"
            checked={exportTransparent}
            label="Transparent background"
            onChange={setExportTransparent}
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="outline"
            size="md"
            leftIcon={<LuCopy size={16} />}
            onClick={onCopy}
            disabled={copying}
            loading={copying}
          >
            Copy PNG
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<LuDownload size={16} />}
            onClick={onExport}
            disabled={exporting}
            loading={exporting}
          >
            Export PNG
          </Button>
        </div>
      </div>
    </Popover>
  );
}