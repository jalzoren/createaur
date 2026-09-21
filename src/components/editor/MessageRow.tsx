import { memo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { Contact, Message } from '../../types';
import { Input, Select, Textarea, Toggle } from '../ui';
import { LuArrowDown, LuArrowUp, LuTrash2 } from '../ui/icons';
import { isValidTime } from '../../lib/time';
import { ReactionPicker } from './ReactionPicker';
import styles from './MessageRow.module.css';

export interface MessageRowProps {
  message: Message;
  contacts: Contact[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onUpdate: (id: string, patch: Partial<Omit<Message, 'id'>>) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onCommitShortcut: (id: string) => void;
}

function MessageRowInner({
  message,
  contacts,
  canMoveUp,
  canMoveDown,
  onUpdate,
  onRemove,
  onMove,
  onCommitShortcut,
}: MessageRowProps) {
  const sender = contacts.find((c) => c.id === message.contactId);
  const isSelf = sender?.isSelf === true;
  const senderName = sender?.name ?? 'Unknown';

  const [timestampInvalid, setTimestampInvalid] = useState(false);

  const handleTimestampBlur = (value: string): void => {
    if (value.trim() === '') {
      onUpdate(message.id, { timestamp: undefined });
      setTimestampInvalid(false);
    } else if (isValidTime(value)) {
      onUpdate(message.id, { timestamp: value });
      setTimestampInvalid(false);
    } else {
      setTimestampInvalid(true);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onCommitShortcut(message.id);
    }
  };

  return (
    <li className={styles.card} role="listitem">
      <div className={styles.topLine}>
        <Select
          value={message.contactId}
          aria-label="Sender"
          className={styles.senderSelect}
          onChange={(e) => onUpdate(message.id, { contactId: e.target.value })}
        >
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <span className={styles.actions}>
          <button
            type="button"
            className={styles.iconAction}
            aria-label="Move message up"
            disabled={!canMoveUp}
            onClick={() => onMove(message.id, 'up')}
          >
            <LuArrowUp size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconAction}
            aria-label="Move message down"
            disabled={!canMoveDown}
            onClick={() => onMove(message.id, 'down')}
          >
            <LuArrowDown size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconAction}
            data-danger
            aria-label="Delete message"
            onClick={() => onRemove(message.id)}
          >
            <LuTrash2 size={14} aria-hidden="true" />
          </button>
        </span>
      </div>

      <Textarea
        value={message.text}
        data-message-textarea={message.id}
        placeholder="Type a message…"
        maxLength={1000}
        maxRows={4}
        onChange={(e) => onUpdate(message.id, { text: e.target.value })}
        onKeyDown={onKeyDown}
        aria-label={`Message by ${senderName}`}
      />

      <div className={styles.bottomLine}>
        <span className={styles.meta}>
          <Input
            value={message.timestamp ?? ''}
            maxLength={5}
            placeholder="HH:MM"
            aria-label="Timestamp (HH:MM)"
            className={styles.timeInput}
            invalid={timestampInvalid}
            onChange={(e) => {
              const value = e.target.value;
              if (value !== message.timestamp) onUpdate(message.id, { timestamp: value });
            }}
            onBlur={(e) => handleTimestampBlur(e.target.value)}
          />
          <ReactionPicker
            message={message}
            contacts={contacts}
            onChange={(reaction) => onUpdate(message.id, { reaction })}
          />
        </span>
        {isSelf && (
          <Toggle
            checked={message.isRead === true}
            label="Read"
            id={`read-${message.id}`}
            onChange={(checked) => onUpdate(message.id, { isRead: checked })}
          />
        )}
      </div>
    </li>
  );
}

export const MessageRow = memo(MessageRowInner);