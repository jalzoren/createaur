import type { ExportScale, TemplateId } from '../types';

export const EXPORT_NODE_ID = 'createaur-export';

const MAX_CANVAS_PIXELS = 16_000_000; // Safari's effective upper bound

export interface ExportOptions {
  pixelRatio: ExportScale;
  transparentCorners: boolean; // when roundedCorners is on
  filename?: string;
}

/** Largest pixel ratio that stays under the browser canvas pixel limit. */
export function effectivePixelRatio(contentHeight: number, requested: ExportScale): ExportScale {
  if (contentHeight <= 0) return 1;
  let ratio = requested as number;
  while (ratio > 1 && 390 * ratio * contentHeight * ratio > MAX_CANVAS_PIXELS) {
    ratio -= 1;
  }
  return ratio as ExportScale;
}

export function exportFilename(template: TemplateId, now: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(
    now.getHours(),
  )}${pad(now.getMinutes())}`;
  return `createaur-${template}-${stamp}.png`;
}

/**
 * Renders the export node to a PNG blob at the requested pixel ratio. The node
 * must be in the DOM (the preview frame is exported unscaled, so the parent
 * transform is neutralized in the cloned output).
 */
export async function renderChatBlob(node: HTMLElement, opts: ExportOptions): Promise<Blob> {
  const { toBlob } = await import('html-to-image');
  await document.fonts.ready;

  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const options = {
    pixelRatio: opts.pixelRatio,
    cacheBust: true,
    width,
    height,
    style: { transform: 'none', transformOrigin: 'top left', margin: '0' },
    backgroundColor: opts.transparentCorners
      ? undefined
      : getComputedStyle(node).backgroundColor,
  };

  // Safari/WebKit quirk: the first call sometimes omits images or fonts.
  await toBlob(node, options);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error('Render failed');
  return blob;
}

export interface ExportResult {
  filename: string;
  ratio: ExportScale;
}

/** Render the export node to a PNG and trigger a browser download. */
export async function exportPng(
  opts: ExportOptions,
  template: TemplateId,
): Promise<ExportResult> {
  const node = document.getElementById(EXPORT_NODE_ID);
  if (!node) throw new Error('Preview not found');

  const ratio = effectivePixelRatio(node.offsetHeight, opts.pixelRatio);
  const filename = opts.filename ?? exportFilename(template);
  const blob = await renderChatBlob(node, { ...opts, pixelRatio: ratio });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);

  return { filename, ratio };
}

/** Whether the Clipboard API + ClipboardItem are available in this browser. */
export function isClipboardSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof ClipboardItem !== 'undefined' &&
    typeof navigator.clipboard?.write === 'function'
  );
}

/** Copy the rendered PNG to the clipboard (passes the promise to satisfy Safari). */
export async function copyChatPng(opts: ExportOptions): Promise<void> {
  const node = document.getElementById(EXPORT_NODE_ID);
  if (!node) throw new Error('Preview not found');
  if (!isClipboardSupported()) throw new Error('Clipboard unsupported');

  const ratio = effectivePixelRatio(node.offsetHeight, opts.pixelRatio);
  const blobPromise = renderChatBlob(node, { ...opts, pixelRatio: ratio });
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })]);
}