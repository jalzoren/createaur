import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { useToastStore } from '../../store/useToastStore';
import { Button, Modal } from '../ui';
import { LuInbox, LuPlus, LuTrash2 } from '../ui/icons';
import { MessageRow } from './MessageRow';
import styles from './MessageEditor.module.css';

export function MessageEditor() {
  const messages = useChatStore((s) => s.messages);
  const contacts = useChatStore((s) => s.contacts);
  const template = useChatStore((s) => s.template);
  const addMessage = useChatStore((s) => s.addMessage);
  const updateMessage = useChatStore((s) => s.updateMessage);
  const removeMessage = useChatStore((s) => s.removeMessage);
  const moveMessage = useChatStore((s) => s.moveMessage);
  const clearMessages = useChatStore((s) => s.clearMessages);

  const [confirmClear, setConfirmClear] = useState(false);
  const [pendingFocus, setPendingFocus] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!pendingFocus) return;
    if (pendingFocus === '__add__') {
      addButtonRef.current?.focus();
      setPendingFocus(null);
      return;
    }
    const node = document.querySelector<HTMLTextAreaElement>(
      `[data-message-textarea="${CSS.escape(pendingFocus)}"]`,
    );
    node?.focus();
    if (node) {
      const len = node.value.length;
      node.setSelectionRange(len, len);
    }
    setPendingFocus(null);
  }, [pendingFocus]);

  const handleAdd = (afterId?: string): void => {
    const id = addMessage(afterId);
    setPendingFocus(id);
    useToastStore.getState().showToast('Message added');
  };

  const handleRemove = (id: string): void => {
    const index = messages.findIndex((m) => m.id === id);
    removeMessage(id);
    const next = messages[index + 1] ?? messages[index - 1];
    setPendingFocus(next?.id ?? '__add__');
    useToastStore.getState().showToast('Message deleted');
  };

  const handleClear = (): void => {
    clearMessages();
    setConfirmClear(false);
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.counter} aria-live="polite">
          {messages.length} message{messages.length === 1 ? '' : 's'}
        </span>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<LuTrash2 size={14} />}
            onClick={() => setConfirmClear(true)}
          >
            Clear all
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className={styles.empty}>
          <LuInbox size={32} aria-hidden="true" />
          <p className={styles.emptyText}>No messages yet</p>
          <Button variant="primary" size="md" onClick={() => handleAdd()}>
            Add the first message
          </Button>
        </div>
      ) : (
        <ul className={styles.list} role="list">
          {messages.map((message, index) => (
            <li key={message.id} className={styles.li}>
              {index > 0 && (
                <button
                  type="button"
                  className={styles.insertButton}
                  aria-label="Insert a message above"
                  onClick={() => handleAdd(messages[index - 1]?.id)}
                >
                  <LuPlus size={14} aria-hidden="true" />
                </button>
              )}
              <MessageRow
                message={message}
                contacts={contacts}
                canMoveUp={index > 0}
                canMoveDown={index < messages.length - 1}
                onUpdate={updateMessage}
                onRemove={handleRemove}
                onMove={moveMessage}
                onCommitShortcut={(id) => handleAdd(id)}
              />
            </li>
          ))}
        </ul>
      )}

      {messages.length > 0 && (
        <Button
          ref={addButtonRef}
          variant="outline"
          size="md"
          leftIcon={<LuPlus size={16} />}
          className={styles.addButton}
          onClick={() => handleAdd()}
        >
          Add message
        </Button>
      )}

      {messages.length > 60 && (
        <p className={styles.notice}>Long chats export at a lower resolution on some browsers.</p>
      )}

      {template === 'twitter-post' && (
        <p className={styles.notice}>
          On the X · Post template, the first message is the posted tweet; extra messages become
          replies from their contacts.
        </p>
      )}

      {template === 'facebook-post' && (
        <p className={styles.notice}>
          On the Facebook Post template, the first message is the post and the rest appear as comments.
        </p>
      )}

      <Modal
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="Clear all messages?"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClear}>
              Clear all
            </Button>
          </>
        }
      >
        <p>Clear all messages? This can't be undone.</p>
      </Modal>
    </div>
  );
}