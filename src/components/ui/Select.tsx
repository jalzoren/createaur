import { forwardRef } from 'react';
import type { ReactNode, SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import { LuChevronDown } from './icons';
import styles from './Select.module.css';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid = false, className, children, ...rest },
  ref,
) {
  return (
    <span className={styles.wrap}>
      <select
        ref={ref}
        data-invalid={invalid ? 'true' : undefined}
        aria-invalid={invalid || undefined}
        className={cn(styles.root, className)}
        {...rest}
      >
        {children}
      </select>
      <span className={styles.icon} aria-hidden="true">
        <LuChevronDown size={14} />
      </span>
    </span>
  );
});