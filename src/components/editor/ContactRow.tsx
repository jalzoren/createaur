import { useRef, useState } from 'react';
import type { Contact } from '../../types';
import { useChatStore } from '../../store/useChatStore';
import { useToastStore } from '../../store/useToastStore';
import { fileToAvatarDataUrl, urlToAvatarDataUrl } from '../../lib/image';
import { Button, ColorInput, Input, Modal, Popover } from '../ui';
import { LuBadgeCheck, LuTrash2 } from '../ui/icons';
import { Avatar } from '../templates/shared/Avatar';
import styles from './ContactRow.module.css';

export interface ContactRowProps {
  contact: Contact;
  showHandle: boolean;
  isGroup: boolean;
  isLast: boolean;
  messageCount: number;
}

export function ContactRow({
  contact,
  showHandle,
  isGroup,
  isLast,
  messageCount,
}: ContactRowProps) {
  const updateContact = useChatStore((s) => s.updateContact);
  const setSelf = useChatStore((s) => s.setSelf);
  const removeContact = useChatStore((s) => s.removeContact);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const canDelete = !contact.isSelf && !isLast;

  const handleFile = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    try {
      setUploading(true);
      const dataUrl = await fileToAvatarDataUrl(file);
      updateContact(contact.id, { avatarUrl: dataUrl });
    } catch (err) {
      useToastStore
        .getState()
        .showToast(err instanceof Error ? err.message : 'Could not read that image.', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleUrl = async (url: string): Promise<void> => {
    if (!url.trim()) return;
    try {
      setUploading(true);
      const dataUrl = await urlToAvatarDataUrl(url.trim());
      updateContact(contact.id, { avatarUrl: dataUrl });
      setUrlOpen(false);
    } catch {
      useToastStore
        .getState()
        .showToast(
          "That site doesn't allow embedding — upload the image instead",
          'error',
        );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.row} data-self={contact.isSelf ? 'true' : undefined}>
      <div className={styles.main}>
        <button
          type="button"
          className={styles.avatarButton}
          aria-label={`Change ${contact.name}'s avatar`}
          onClick={() => fileRef.current?.click()}
        >
          <Avatar name={contact.name} seed={contact.id} avatarUrl={contact.avatarUrl} size={32} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className={styles.hiddenFile}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />

        <div className={styles.fields}>
          <Input
            value={contact.name}
            maxLength={40}
            aria-label="Contact name"
            data-contact-name={contact.id}
            className={styles.nameInput}
            onChange={(e) => updateContact(contact.id, { name: e.target.value })}
            onBlur={(e) => {
              const trimmed = e.target.value.trim();
              if (trimmed && trimmed !== e.target.value) {
                updateContact(contact.id, { name: trimmed });
              }
            }}
          />
          {showHandle && (
            <Input
              value={contact.handle ?? ''}
              maxLength={32}
              aria-label={`${contact.name} handle`}
              placeholder="@handle (X)"
              className={styles.handleInput}
              onChange={(e) => updateContact(contact.id, { handle: e.target.value })}
            />
          )}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          role="radio"
          aria-checked={contact.isSelf}
          className={styles.youButton}
          data-checked={contact.isSelf ? 'true' : undefined}
          onClick={() => {
            if (!contact.isSelf) setSelf(contact.id);
          }}
        >
          <span className={styles.youDot} aria-hidden="true" />
          You
        </button>

        <button
          type="button"
          className={styles.iconAction}
          aria-label={`${contact.isVerified ? 'Unmark' : 'Mark'} ${contact.name} as verified`}
          aria-pressed={contact.isVerified}
          data-active={contact.isVerified ? 'true' : undefined}
          onClick={() => updateContact(contact.id, { isVerified: !contact.isVerified })}
        >
          <LuBadgeCheck size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.onlineDot}
          aria-label={`${contact.isOnline ? 'Mark offline' : 'Mark online'} ${contact.name}`}
          aria-pressed={contact.isOnline}
          data-active={contact.isOnline ? 'true' : undefined}
          onClick={() => updateContact(contact.id, { isOnline: !contact.isOnline })}
        />

        <Popover
          open={urlOpen}
          onOpenChange={setUrlOpen}
          align="end"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`${contact.name} avatar from URL`}
              title="Paste an image URL"
              loading={uploading}
            >
              URL
            </Button>
          }
        >
          <UrlForm onSubmit={handleUrl} />
        </Popover>

        <button
          type="button"
          className={styles.iconAction}
          data-danger
          aria-label={`Remove ${contact.name}`}
          disabled={!canDelete}
          onClick={() => {
            if (canDelete) setConfirmDelete(true);
          }}
        >
          <LuTrash2 size={16} aria-hidden="true" />
        </button>
      </div>

      {isGroup && !contact.isSelf && (
        <div className={styles.bubbleColorRow}>
          <ColorInput
            label="Bubble color"
            value={contact.bubbleColor ?? '#8E8E93'}
            onChange={(hex) => updateContact(contact.id, { bubbleColor: hex })}
          />
        </div>
      )}

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Remove ${contact.name}?`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                removeContact(contact.id);
                setConfirmDelete(false);
              }}
            >
              Remove
            </Button>
          </>
        }
      >
        <p>
          {messageCount > 0
            ? `Their ${messageCount} message${messageCount === 1 ? '' : 's'} will be reassigned to you.`
            : 'They have no messages to reassign.'}
        </p>
      </Modal>
    </div>
  );
}

function UrlForm({ onSubmit }: { onSubmit: (url: string) => Promise<void> }) {
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (): Promise<void> => {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      await onSubmit(draft);
      setDraft('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.urlForm}>
      <Input
        value={draft}
        placeholder="Paste image URL"
        aria-label="Avatar image URL"
        className={styles.urlInput}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void submit();
        }}
      />
      <Button variant="primary" size="sm" onClick={() => void submit()} disabled={busy || !draft.trim()}>
        Apply
      </Button>
    </div>
  );
}