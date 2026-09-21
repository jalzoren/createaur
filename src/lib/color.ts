const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Validates `#RGB` or `#RRGGBB` (case-insensitive). */
export function isValidHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

/** Expands `#abc` -> `#aabbcc`. Pass-through for full-length hex. */
export function expandHex(value: string): string {
  const trimmed = value.trim();
  if (!isValidHex(trimmed)) return trimmed;
  const hex = trimmed.replace('#', '');
  if (hex.length === 3) {
    return `#${hex
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return trimmed;
}

export function clampAlpha(alpha: number): number {
  if (Number.isNaN(alpha)) return 1;
  return Math.min(1, Math.max(0, alpha));
}

/** Deterministic pastel hue for initials avatars, from any string seed. */
export function stringToHsl(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + (seed.charCodeAt(i) || 0)) % 360;
  }
  return `hsl(${hash} 42% 52%)`;
}

/** Returns an `rgba(r, g, b, a)` CSS color from a `#RGB`/`#RRGGBB` hex. */
export function hexToRgba(value: string, alpha: number): string {
  const full = expandHex(value);
  const hex = full.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return full;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const a = clampAlpha(alpha);
  if (r === undefined || g === undefined || b === undefined) return full;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}