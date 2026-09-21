import { useMemo } from 'react';
import { stringToHsl } from '../../../lib/color';
import { cssVars } from '../../../lib/cn';

export interface AvatarProps {
  name: string;
  avatarUrl?: string;
  seed: string;
  size: number;
}

/**
 * Renders an avatar image when available, otherwise initials on a
 * deterministic background seeded by the contact id. Alt text is empty — names
 * already appear in surrounding text.
 */
export function Avatar({ name, avatarUrl, seed, size }: AvatarProps) {
  const hsl = useMemo(() => stringToHsl(seed), [seed]);
  const initials = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '?';
    const last = parts[1]?.[0];
    return (first + (last ?? '')).toUpperCase();
  }, [name]);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={cssVars(
        { '--avatar-bg': hsl, '--avatar-size': size },
        {
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.4,
          fontWeight: 600,
          color: '#ffffff',
          backgroundColor: hsl,
          flex: 'none',
          lineHeight: 1,
          overflow: 'hidden',
        },
      )}
    >
      {initials}
    </span>
  );
}