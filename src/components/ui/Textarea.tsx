import { forwardRef, useEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';
import styles from './Textarea.module.css';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> {
  invalid?: boolean;
  minRows?: number;
  maxRows?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, className, minRows = 1, maxRows = 6, value, onChange, ...rest },
  ref,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);

  const resize = (): void => {
    const node = innerRef.current;
    if (!node) return;
    node.style.height = 'auto';
    const lineHeight = 20; // --lh-sm
    const maxHeight = maxRows * lineHeight;
    const nextHeight = Math.min(node.scrollHeight, maxHeight);
    node.style.height = `${nextHeight}px`;
    node.style.overflowY = node.scrollHeight > maxHeight ? 'auto' : 'hidden';
  };

  useEffect(resize, [value, maxRows]);
  useEffect(() => {
    resize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <textarea
      ref={(node) => {
        innerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      rows={minRows}
      data-invalid={invalid ? 'true' : undefined}
      aria-invalid={invalid || undefined}
      value={value}
      onChange={(event) => {
        onChange?.(event);
        resize();
      }}
      className={cn(styles.root, className)}
      {...rest}
    />
  );
});