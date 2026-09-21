import { useEffect, useRef, useState } from 'react';
import { cssVars } from '../../lib/cn';
import { expandHex, isValidHex } from '../../lib/color';
import styles from './ColorInput.module.css';

export interface ColorInputProps {
  value: string;
  onChange: (hex: string) => void;
  label?: string;
}

/**
 * A small swatch button (label-free) plus a hex text field. Invalid text shows
 * an error state; the last valid color is kept until a valid one is entered.
 */
export function ColorInput({ value, onChange, label }: ColorInputProps) {
  const [draft, setDraft] = useState(value);
  const [invalid, setInvalid] = useState(false);
  const nativeRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!invalid) setDraft(value);
  }, [value, invalid]);

  const swatchColor = isValidHex(value) ? expandHex(value) : '#888888';

  return (
    <div className={styles.root}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        className={styles.swatch}
        aria-label={label ? `${label} color` : 'Choose color'}
        style={cssVars({ '--swatch': swatchColor })}
        onClick={() => nativeRef.current?.click()}
      />
      <input
        ref={nativeRef}
        type="color"
        className={styles.native}
        tabIndex={-1}
        aria-hidden="true"
        value={swatchColor}
        onChange={(e) => onChange(expandHex(e.target.value))}
      />
      <input
        type="text"
        inputMode="text"
        spellCheck={false}
        size={7}
        value={draft}
        aria-label={label ? `${label} hex value` : 'Hex color'}
        aria-invalid={invalid || undefined}
        data-invalid={invalid ? 'true' : undefined}
        className={styles.text}
        onChange={(e) => {
          const raw = e.target.value;
          setDraft(raw);
          if (isValidHex(raw)) {
            setInvalid(false);
            onChange(expandHex(raw));
          } else {
            setInvalid(true);
          }
        }}
        onBlur={() => {
          setDraft(value);
          setInvalid(false);
        }}
      />
    </div>
  );
}