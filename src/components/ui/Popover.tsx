import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn, cssVars } from '../../lib/cn';
import styles from './Popover.module.css';

export interface PopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
  contentClassName?: string;
}

interface Position {
  top: number;
  left: number;
  below: boolean;
}

/**
 * Lightweight popover: renders its content in a portal anchored to the
 * trigger. Flips above when there is no room below. Closes on outside click
 * and Escape, and returns focus to the trigger on close.
 */
export function Popover({
  open,
  onOpenChange,
  trigger,
  children,
  align = 'end',
  className,
  contentClassName,
}: PopoverProps) {
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<Position | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      return;
    }
    const triggerNode = triggerRef.current;
    const contentNode = contentRef.current;
    if (!triggerNode) return;

    const measure = (): void => {
      const rect = triggerNode.getBoundingClientRect();
      const contentHeight = contentNode?.offsetHeight ?? 0;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const below = spaceBelow >= contentHeight || spaceBelow > rect.top;
      const top = below ? rect.bottom + 6 : Math.max(8, rect.top - contentHeight - 6);
      const viewportWidth = window.innerWidth;
      const contentWidth = contentNode?.offsetWidth ?? rect.width;
      let left: number;
      if (align === 'start') left = rect.left;
      else if (align === 'center') left = rect.left + rect.width / 2 - contentWidth / 2;
      else left = rect.right - contentWidth;
      left = Math.max(8, Math.min(left, viewportWidth - contentWidth - 8));
      setPos({ top, left, below });
    };

    measure();
    const rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [open, align]);

  useEffect(() => {
    if (!open) return () => undefined;
    const onPointerDown = (e: MouseEvent): void => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (contentRef.current?.contains(t)) return;
      onOpenChange(false);
    };
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        onOpenChange(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const onResize = (): void => onOpenChange(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, onOpenChange]);

  return (
    <>
      <span ref={triggerRef} className={cn(styles.trigger, className)}>
        {trigger}
      </span>
      {open && pos && (
        createPortal(
          <div
            ref={contentRef}
            role="presentation"
            className={cn(styles.content, contentClassName)}
            style={cssVars({
              '--popover-top': pos.top,
              '--popover-left': pos.left,
              '--popover-below': pos.below ? '1' : '0',
            })}
          >
            {children}
          </div>,
          document.body,
        )
      )}
    </>
  );
}