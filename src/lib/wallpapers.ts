export interface WallpaperPreset {
  label: string;
  light: string;
  dark: string;
}

export const WALLPAPERS: Record<string, WallpaperPreset> = {
  'ios-gray': { label: 'iOS Gray', light: '#F2F2F7', dark: '#000000' },
  white: { label: 'White', light: '#FFFFFF', dark: '#1C1C1E' },
  paper: { label: 'Paper', light: '#F7F3EA', dark: '#1F1B16' },
  mint: { label: 'Mint', light: '#E3F4EC', dark: '#0E2A22' },
  sky: { label: 'Sky', light: '#E6F0FF', dark: '#0B1B33' },
  sunset: {
    label: 'Sunset',
    light: 'linear-gradient(180deg,#FFE3D5,#FFC2D4)',
    dark: 'linear-gradient(180deg,#2B1730,#3A1B2E)',
  },
  ocean: {
    label: 'Ocean',
    light: 'linear-gradient(180deg,#D7ECFF,#B8D7F5)',
    dark: 'linear-gradient(180deg,#0B1B33,#0F2E4D)',
  },
};

export const WALLPAPER_KEYS = Object.keys(WALLPAPERS);

/**
 * Resolve a wallpaper value for a given preview dark mode. Preset keys use the
 * matching light/dark value; custom values (hex, gradient strings) pass
 * through untouched.
 */
export function resolveWallpaper(value: string, darkMode: boolean): string {
  const preset = WALLPAPERS[value];
  if (preset) return darkMode ? preset.dark : preset.light;
  return value;
}