import type { CSSProperties } from 'react';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Build a CSSProperties object from CSS custom properties (and anything else).
 * Values are typed as `string | number | undefined` so no `any` leaks.
 */
export function cssVars(
  vars: Record<string, string | number | undefined>,
  extras?: CSSProperties,
): CSSProperties {
  const custom: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) {
    if (value === undefined) continue;
    custom[key] = String(value);
  }
  return Object.assign({}, extras, custom) as CSSProperties;
}