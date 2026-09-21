import { useState } from 'react';
import type { Contact, Message, Reaction, ReactionEmoji } from '../../types';
import { REACTION_EMOJIS } from '../../types';
import { Popover } from '../ui';
import { LuSmile } from '../ui/icons';
import styles from './ReactionPicker.module.css';

export interface ReactionPickerProps {
  message: Message;
  contacts: Contact[];
  onChange: (reaction: Reaction | undefined) => void;
}

export function ReactionPicker({ message, contacts, onChange }: ReactionPickerProps) {
  const [open, setOpen] = useState(false);
  const current = message.reaction;

  const defaultFrom = () => {
    const other = contacts.find((c) => !c.isSelf && c.id !== message.contactId);
    const anyOther = contacts.find((c) => !c.isSelf);
    return other?.id ?? anyOther?.id ?? message.contactId;
  };

  const pick = (emoji: ReactionEmoji | undefined): void => {
    if (!emoji) {
      onChange(undefined);
    } else {
      onChange({ emoji, fromContactId: current?.fromContactId ?? defaultFrom() });
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      align="start"
      trigger={
        <button
          type="button"
          className={styles.trigger}
          aria-label="Add reaction"
          data-active={current ? 'true' : undefined}
          title="Add reaction"
        >
          <LuSmile size={16} aria-hidden="true" />
        </button>
      }
    >
      <div className={styles.grid}>
        {REACTION_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className={styles.emoji}
            data-selected={current?.emoji === emoji ? 'true' : undefined}
            aria-label={`React with ${emoji}`}
            aria-pressed={current?.emoji === emoji}
            onClick={() => pick(emoji)}
          >
            {emoji}
          </button>
        ))}
        <button
          type="button"
          className={styles.none}
          data-selected={!current ? 'true' : undefined}
          onClick={() => pick(undefined)}
        >
          None
        </button>
      </div>
      <div className={styles.row}>
        <label className={styles.label} htmlFor="reaction-from">
          Reaction from
        </label>
        <select
          id="reaction-from"
          className={styles.select}
          value={current?.fromContactId ?? defaultFrom()}
          onChange={(e) => onChange({ emoji: current?.emoji ?? '❤️', fromContactId: e.target.value })}
        >
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
    </Popover>
  );
}