import { useEffect, useRef, useState } from 'react';
import type { ChatConfig, TemplateId } from '../../types';
import { TEMPLATE_IDS, TEMPLATE_DEFAULTS } from '../../types';
import { useChatStore } from '../../store/useChatStore';
import { useToastStore } from '../../store/useToastStore';
import { TEMPLATE_LABELS, TemplateRenderer } from '../templates';
import styles from './TemplatePicker.module.css';

export function TemplatePicker() {
  const config = useChatStore((s) => pickConfigSnapshot(s));
  const active = useChatStore((s) => s.template);
  const setTemplate = useChatStore((s) => s.setTemplate);

  const snap = useThrottledConfig(config);

  return (
    <div className={styles.root} role="radiogroup" aria-label="Chat template">
      {TEMPLATE_IDS.map((id) => {
        const activeTemplate = active === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={activeTemplate}
            className={styles.card}
            data-selected={activeTemplate ? 'true' : undefined}
            onClick={() => {
              setTemplate(id);
              useToastStore.getState().showToast(`${TEMPLATE_LABELS[id]} selected`);
            }}
          >
            <span className={styles.thumb} aria-hidden="true">
              <span className={styles.scale}>
                <span className={styles.preview} data-template={id}>
                  <TemplateRenderer
                    id={id}
                    config={{
                      ...snap,
                      template: id,
                      darkMode:
                        snap.template === id
                          ? snap.darkMode
                          : TEMPLATE_DEFAULTS[id].darkMode === true
                            ? true
                            : false,
                      wallpaper:
                        snap.template === id
                          ? snap.wallpaper
                          : TEMPLATE_DEFAULTS[id].wallpaper,
                      xTheme:
                        snap.template === id
                          ? snap.xTheme
                          : TEMPLATE_DEFAULTS[id].xTheme ?? 'dim',
                    }}
                  />
                </span>
              </span>
            </span>
            <span className={styles.label}>
              <span>{TEMPLATE_LABELS[id]}</span>
              {activeTemplate && <span className={styles.check}>✓</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Render templates from a slightly debounced snapshot so typing stays smooth. */
function useThrottledConfig(config: ChatConfig): ChatConfig {
  const [snap, setSnap] = useState(config);
  const last = useRef(config);

  useEffect(() => {
    last.current = config;
    const timer = setTimeout(() => {
      setSnap((prev) => (prev === last.current ? prev : last.current));
    }, 200);
    return () => clearTimeout(timer);
  }, [config]);

  return snap;
}

function pickConfigSnapshot(s: {
  template: TemplateId;
  contacts: ChatConfig['contacts'];
  messages: ChatConfig['messages'];
  chatTitle?: string;
  dateLabel: string;
  darkMode: boolean;
  wallpaper: string;
  xTheme: ChatConfig['xTheme'];
  time: string;
  battery: number;
  carrier: string;
  signalBars: ChatConfig['signalBars'];
  showStatusBar: boolean;
  showTimestamp: boolean;
  showAvatars: boolean;
  showReadReceipts: boolean;
  bubbleOpacity: number;
  roundedCorners: boolean;
}): ChatConfig {
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
  } = s;
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