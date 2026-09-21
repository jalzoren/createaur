import { useToastStore } from '../../store/useToastStore';
import styles from './Toast.module.css';

export function Toast() {
  const message = useToastStore((s) => s.message);
  const kind = useToastStore((s) => s.kind);
  const dismiss = useToastStore((s) => s.dismiss);

  if (!message) return null;

  return (
    <div className={styles.root} role="status" data-kind={kind} aria-live="polite">
      <span className={styles.text}>{message}</span>
      <button type="button" className={styles.dismiss} aria-label="Dismiss notification" onClick={dismiss}>
        ×
      </button>
    </div>
  );
}