import { useEffect, useMemo, useRef, useState } from 'react';
import { useElementSize } from '../hooks/useElementSize';
import { useChatStore } from '../store/useChatStore';
import { cssVars } from '../lib/cn';
import { EXPORT_NODE_ID } from '../lib/export';
import { TemplateErrorBoundary } from './PreviewError';
import { TemplateRenderer } from './templates';
import styles from './PreviewCanvas.module.css';

/**
 * Renders the active template at 390px natural width, scaled with a CSS
 * transform to always fit its container (width and height). Exporting still
 * uses the natural pixels at 1x-3x, so a small preview never loses quality.
 */
export function PreviewCanvas() {
  const config = useChatStore((s) => pickConfigSlice(s));

  const { ref: containerRef, width: cw, height: ch } = useElementSize<HTMLDivElement>();
  const [contentH, setContentH] = useState(844);
  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = exportRef.current;
    if (!node) return () => undefined;
    const observer = new ResizeObserver((entries) => {
      setContentH(entries[0]?.contentRect.height ?? 844);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scale = useMemo(() => {
    if (cw <= 0 || ch <= 0 || contentH <= 0) return 1;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return 1;
    const availW = rect.width - 48;
    const availH = rect.height - 64;
    if (availW <= 0 || availH <= 0) return 1;
    const widthScale = Math.min(1, availW / 390);
    const heightScale = Math.min(1, availH / contentH);
    return Math.min(widthScale, heightScale);
  }, [cw, ch, contentH]);

  const layoutW = 390 * scale;
  const layoutH = contentH * scale;

  const ariaLabel = useMemo(() => {
    const names = config.contacts
      .map((c) => c.name)
      .filter(Boolean)
      .join(', ');
    const isGroup = config.contacts.length > 2;
    const kind = isGroup ? 'group' : 'one-to-one';
    return `Preview of an ${config.template} conversation between ${names}, ${kind}, ${config.messages.length} messages`;
  }, [config]);

  return (
    <div className={styles.canvas} ref={containerRef}>
      <div
        className={styles.layoutBox}
        role="img"
        aria-label={ariaLabel}
        style={cssVars({ '--w': layoutW, '--h': layoutH })}
      >
        <div className={styles.scaler} style={cssVars({ '--scale': scale })}>
          <TemplateErrorBoundary onReset={useChatStore.getState().reset}>
            <div
              ref={exportRef}
              id={EXPORT_NODE_ID}
              className={styles.frame}
              data-rounded={config.roundedCorners ? 'true' : 'false'}
            >
              <TemplateRenderer id={config.template} config={config} />
            </div>
          </TemplateErrorBoundary>
        </div>
      </div>
    </div>
  );
}

function pickConfigSlice(s: ReturnType<typeof useChatStore.getState>) {
  return {
    template: s.template,
    contacts: s.contacts,
    messages: s.messages,
    chatTitle: s.chatTitle,
    dateLabel: s.dateLabel,
    darkMode: s.darkMode,
    wallpaper: s.wallpaper,
    xTheme: s.xTheme,
    time: s.time,
    battery: s.battery,
    carrier: s.carrier,
    signalBars: s.signalBars,
    showStatusBar: s.showStatusBar,
    showTimestamp: s.showTimestamp,
    showAvatars: s.showAvatars,
    showReadReceipts: s.showReadReceipts,
    bubbleOpacity: s.bubbleOpacity,
    roundedCorners: s.roundedCorners,
  };
}