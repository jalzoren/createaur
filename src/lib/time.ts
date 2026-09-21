export const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isValidTime(value: string): boolean {
  return HHMM_RE.test(value);
}

/** Trim + validate; returns a normalized 'HH:MM' or undefined when invalid. */
export function normalizeTime(value: string): string | undefined {
  const trimmed = value.trim();
  return isValidTime(trimmed) ? trimmed : undefined;
}

export function parseTimeMinutes(value: string): number {
  const match = HHMM_RE.exec(value);
  if (!match) return -1;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours === undefined || minutes === undefined) return -1;
  return hours * 60 + minutes;
}

/** 24h 'HH:MM' -> 12-hour clock label, e.g. '14:32' -> '2:32 PM'. */
export function formatTime12(value: string): string {
  const minutes = parseTimeMinutes(value);
  if (minutes < 0) return value;
  const rawHours = Math.floor(minutes / 60);
  const rawMinutes = minutes % 60;
  const period = rawHours >= 12 ? 'PM' : 'AM';
  const hours = rawHours % 12 || 12;
  const mm = String(rawMinutes).padStart(2, '0');
  return `${hours}:${mm} ${period}`;
}