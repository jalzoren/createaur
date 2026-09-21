import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';
import styles from './IconButton.module.css';

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: ReactNode;
  /** Required: the button is icon-only for screen readers. */
  'aria-label': string;
  variant?: 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, variant = 'ghost', size = 'sm', className, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      className={cn(styles.root, className)}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
});