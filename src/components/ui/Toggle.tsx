import { cn } from '../../lib/cn';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
}: ToggleProps) {
  const controlId = id ?? 'toggle';
  return (
    <button
      type="button"
      role="switch"
      id={controlId}
      aria-checked={checked}
      disabled={disabled}
      className={cn(styles.row, disabled && styles.disabled)}
      onClick={() => onChange(!checked)}
    >
      {label && (
        <span className={styles.copy}>
          <span className={styles.label}>{label}</span>
          {description && <span className={styles.description}>{description}</span>}
        </span>
      )}
      <span className={styles.switch} data-on={checked ? 'true' : undefined} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </button>
  );
}