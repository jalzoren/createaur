interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * Temporary brand mark: chat bubble on an accent tile. Swapped for final art later.
 */
export function Logo({ size = 26, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      className={className}
      aria-hidden="true"
    >
      <rect width="26" height="26" rx="7" fill="var(--accent-solid)" />
      <path
        d="M13 6.4c-4.5 0-8.2 3-8.2 6.8 0 1.9 1 3.7 2.6 4.9l-.7 3.2 3.4-1.7c.9.2 1.9.4 2.9.4 4.5 0 8.2-3 8.2-6.8s-3.7-6.8-8.2-6.8Z"
        fill="#fff"
        opacity="0.95"
      />
      <circle cx="9.6" cy="13.2" r="1.05" fill="var(--accent-solid)" />
      <circle cx="13" cy="13.2" r="1.05" fill="var(--accent-solid)" />
      <circle cx="16.4" cy="13.2" r="1.05" fill="var(--accent-solid)" />
      <path
        d="M20.1 4.6l.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6.6-1.4Z"
        fill="#fff"
      />
    </svg>
  );
}