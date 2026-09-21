import { cssVars } from '../../lib/cn';
import styles from './Slider.module.css';

export interface SliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  disabled?: boolean;
}

export function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format,
  disabled = false,
}: SliderProps) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100;
  const clampValue = Math.min(max, Math.max(min, value));
  const display = format ? format(clampValue) : String(clampValue);

  return (
    <div className={styles.root} data-disabled={disabled ? 'true' : undefined}>
      {label && (
        <div className={styles.head}>
          <span className={styles.label}>{label}</span>
          <output className={styles.output}>{display}</output>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={clampValue}
        disabled={disabled}
        aria-label={label}
        style={cssVars({ '--fill': `${pct}%` })}
        className={styles.range}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}