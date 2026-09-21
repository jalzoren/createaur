import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { TemplateId, XTheme } from '../../types';
import { X_THEMES } from '../../types';
import { useChatStore } from '../../store/useChatStore';
import { useToastStore } from '../../store/useToastStore';
import { Button, ColorInput, Input, Modal, Slider, Toggle } from '../ui';
import { LuDownload, LuMoon, LuSun, LuUpload } from '../ui/icons';
import { WALLPAPERS, WALLPAPER_KEYS } from '../../lib/wallpapers';
import { isValidTime } from '../../lib/time';
import styles from './StylePanel.module.css';

const DATE_OPTIONS = ['Today', 'Yesterday'] as const;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

export function StylePanel() {
  const config = useChatStore((s) => pickFields(s));
  const updateConfig = useChatStore((s) => s.updateConfig);
  const reset = useChatStore((s) => s.reset);
  const exportConfig = useChatStore((s) => s.exportConfig);
  const importConfig = useChatStore((s) => s.importConfig);

  const [confirmReset, setConfirmReset] = useState(false);
  const importRef = useRef<HTMLInputElement | null>(null);

  const isPost = config.template === 'twitter-post';
  const isPostTemplate = isPost || config.template === 'facebook-post';

  const wallpaperIsPreset = WALLPAPER_KEYS.includes(config.wallpaper);

  const setDateLabel = (raw: string): void => {
    const value = raw.trim();
    if (!value) return;
    updateConfig({ dateLabel: value });
  };

  const handleExport = (): void => {
    const payload = {
      app: 'createaur',
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      config: exportConfig(),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'createaur-chat.json';
    a.click();
    URL.revokeObjectURL(url);
    useToastStore.getState().showToast('Chat data exported.');
  };

  const handleImportFile = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = importConfig(json);
      if (result.ok) {
        useToastStore.getState().showToast('Chat data imported.');
      } else {
        useToastStore.getState().showToast(result.error, 'error');
      }
    } catch {
      useToastStore.getState().showToast('That file isn’t valid JSON.', 'error');
    } finally {
      if (importRef.current) importRef.current.value = '';
    }
  };

  const wallpaperColorFromValue = wallpaperIsPreset
    ? (WALLPAPERS[config.wallpaper]?.[config.darkMode ? 'dark' : 'light'] ?? '#000000')
    : /^#[0-9a-fA-F]{3,8}$/.test(config.wallpaper)
      ? config.wallpaper
      : '#000000';

  return (
    <div className={styles.root}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>
          {isPost ? 'Post theme' : 'Preview theme'}
        </h3>
        {isPost ? (
          <Segmented
            value={config.xTheme}
            options={X_THEMES.map((theme) => ({
              value: theme,
              label: theme.charAt(0).toUpperCase() + theme.slice(1),
            }))}
            onChange={(v) => updateConfig({ xTheme: v as XTheme })}
          />
        ) : (
          <Segmented
            value={config.darkMode ? 'dark' : 'light'}
            options={[
              { value: 'light', label: 'Light', icon: <LuSun size={14} /> },
              { value: 'dark', label: 'Dark', icon: <LuMoon size={14} /> },
            ]}
            onChange={(v) => updateConfig({ darkMode: v === 'dark' })}
          />
        )}
      </section>

      {!isPostTemplate && (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Wallpaper</h3>
        <div className={styles.chipGrid} role="radiogroup" aria-label="Wallpaper presets">
          {WALLPAPER_KEYS.map((key) => {
            const meta = WALLPAPERS[key];
            if (!meta) return null;
            const value = meta[config.darkMode ? 'dark' : 'light'];
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={wallpaperIsPreset && config.wallpaper === key}
                className={styles.chip}
                onClick={() => updateConfig({ wallpaper: key })}
              >
                <span
                  className={styles.swatch}
                  style={{ background: value }}
                  aria-hidden="true"
                />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.customRow}>
          <ColorInput
            label="Custom color"
            value={wallpaperColorFromValue}
            onChange={(hex) => updateConfig({ wallpaper: hex })}
          />
        </div>
      </section>
      )}

      {!isPostTemplate && (
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Status bar</h3>
        <Toggle
          id="show-status-bar"
          checked={config.showStatusBar}
          label="Show status bar"
          onChange={(v) => updateConfig({ showStatusBar: v })}
        />
        {config.showStatusBar && (
          <div className={styles.grid2}>
            <Field label="Time">
              <Input
                value={config.time}
                maxLength={5}
                aria-label="Status bar time"
                onChange={(e) => {
                  const v = e.target.value;
                  if (isValidTime(v)) updateConfig({ time: v });
                }}
              />
            </Field>
            <Field label="Carrier">
              <Input
                value={config.carrier}
                maxLength={16}
                aria-label="Carrier name"
                onChange={(e) => updateConfig({ carrier: e.target.value })}
              />
            </Field>
          </div>
        )}
        <Field label="Signal bars">
          <Segmented
            value={String(config.signalBars)}
            options={[
              { value: '0', label: '0' },
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
            ]}
            onChange={(v) => updateConfig({ signalBars: Number(v) as 0 | 1 | 2 | 3 | 4 })}
          />
        </Field>
        <Field label="Battery">
          <Slider
            min={0}
            max={100}
            step={1}
            value={config.battery}
            onChange={(v) => updateConfig({ battery: v })}
            format={(v) => `${v}%`}
          />
        </Field>
      </section>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Chat details</h3>
        {!isPostTemplate && (
        <Field label="Date label">
          <DateLabelPicker value={config.dateLabel} onChange={setDateLabel} />
        </Field>
        )}
        {!isPostTemplate && (
        <Toggle
          id="show-avatars"
          checked={config.showAvatars}
          label="Show avatars (group chats)"
          onChange={(v) => updateConfig({ showAvatars: v })}
        />
        )}
        {!isPostTemplate && (
        <Toggle
          id="show-timestamps"
          checked={config.showTimestamp}
          label="Show timestamps"
          onChange={(v) => updateConfig({ showTimestamp: v })}
        />
        )}
        {!isPostTemplate && (
        <Toggle
          id="show-read-receipts"
          checked={config.showReadReceipts}
          label="Show read receipts"
          onChange={(v) => updateConfig({ showReadReceipts: v })}
        />
        )}
        {!isPostTemplate && (
        <Field label="Bubble opacity">
          <Slider
            min={0.6}
            max={1}
            step={0.05}
            value={config.bubbleOpacity}
            onChange={(v) => updateConfig({ bubbleOpacity: v })}
            format={(v) => `${Math.round(v * 100)}%`}
          />
        </Field>
        )}
        <Toggle
          id="rounded-corners"
          checked={config.roundedCorners}
          label="Rounded preview corners"
          onChange={(v) => updateConfig({ roundedCorners: v })}
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Chat data</h3>
        <div className={styles.dataActions}>
          <Button
            variant="outline"
            size="md"
            leftIcon={<LuDownload size={16} />}
            onClick={handleExport}
          >
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<LuUpload size={16} />}
            onClick={() => importRef.current?.click()}
          >
            Import JSON
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json,.json"
            className={styles.hiddenFile}
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => void handleImportFile(e.target.files?.[0])}
          />
          <Button variant="ghost" size="md" data-danger onClick={() => setConfirmReset(true)}>
            Reset everything
          </Button>
        </div>
      </section>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset everything?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                reset();
                setConfirmReset(false);
              }}
            >
              Reset
            </Button>
          </>
        }
      >
        <p>All contacts, messages and settings return to the default screenshot.</p>
      </Modal>
    </div>
  );
}

function pickFields(s: {
  template: TemplateId;
  xTheme: XTheme;
  darkMode: boolean;
  wallpaper: string;
  time: string;
  battery: number;
  carrier: string;
  signalBars: number;
  showStatusBar: boolean;
  showTimestamp: boolean;
  showAvatars: boolean;
  showReadReceipts: boolean;
  bubbleOpacity: number;
  roundedCorners: boolean;
  dateLabel: string;
}): {
  template: TemplateId;
  xTheme: XTheme;
  darkMode: boolean;
  wallpaper: string;
  time: string;
  battery: number;
  carrier: string;
  signalBars: number;
  showStatusBar: boolean;
  showTimestamp: boolean;
  showAvatars: boolean;
  showReadReceipts: boolean;
  bubbleOpacity: number;
  roundedCorners: boolean;
  dateLabel: string;
} {
  return s;
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string; icon?: ReactNode }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className={styles.segmented} role="radiogroup">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={value === opt.value}
          className={styles.segment}
          data-selected={value === opt.value ? 'true' : undefined}
          onClick={() => onChange(opt.value)}
        >
          {opt.icon}
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

function DateLabelPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const preset = (DATE_OPTIONS as readonly string[]).includes(value) ? value : 'custom';
  return (
    <div className={styles.dateRow}>
      <Segmented
        value={preset}
        options={[
          { value: 'Today', label: 'Today' },
          { value: 'Yesterday', label: 'Yesterday' },
          { value: 'custom', label: 'Custom' },
        ]}
        onChange={(v) => {
          if (v === 'custom') return;
          onChange(v);
        }}
      />
      {preset === 'custom' && (
        <div className={styles.dateCustom}>
          <Input
            value={value}
            aria-label="Custom date label"
            placeholder="Tue, Sep 21"
            maxLength={24}
            onChange={(e) => onChange(e.target.value)}
          />
          <input
            type="date"
            aria-label="Pick a date"
            className={styles.ghostDate}
            onChange={(e) => {
              if (e.target.value) {
                const parsed = new Date(`${e.target.value}T12:00:00`);
                if (!Number.isNaN(parsed.getTime())) onChange(formatDate(parsed));
              }
            }}
          />
        </div>
      )}
    </div>
  );
}