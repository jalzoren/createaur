import { useChatStore } from '../../store/useChatStore';
import { useToastStore } from '../../store/useToastStore';
import { MAX_CONTACTS } from '../../types';
import { Button, Input } from '../ui';
import { LuPlus } from '../ui/icons';
import { ContactRow } from './ContactRow';
import styles from './ContactEditor.module.css';

export function ContactEditor() {
  const contacts = useChatStore((s) => s.contacts);
  const messages = useChatStore((s) => s.messages);
  const chatTitle = useChatStore((s) => s.chatTitle);
  const template = useChatStore((s) => s.template);
  const addContact = useChatStore((s) => s.addContact);
  const updateConfig = useChatStore((s) => s.updateConfig);

  const isGroup = contacts.length > 2;
  const canAdd = contacts.length < MAX_CONTACTS;

  const handleAdd = (): void => {
    if (!canAdd) {
      useToastStore.getState().showToast(`You can have up to ${MAX_CONTACTS} contacts.`, 'error');
      return;
    }
    const id = addContact();
    useToastStore.getState().showToast('Contact added');
    setTimeout(() => {
      document
        .querySelector<HTMLInputElement>(`[data-contact-name="${CSS.escape(id)}"]`)
        ?.focus();
    }, 0);
  };

  return (
    <div className={styles.root}>
      {isGroup && (
        <div className={styles.groupHeader}>
          <label className={styles.groupLabel} htmlFor="chat-title">
            Group name
          </label>
          <Input
            id="chat-title"
            value={chatTitle}
            maxLength={40}
            placeholder="Group name"
            onChange={(e) => updateConfig({ chatTitle: e.target.value })}
          />
        </div>
      )}

      {!isGroup && (
        <p className={styles.hint}>
          You and one other person can message. Add a third person to make this a group chat.
        </p>
      )}

      <ul className={styles.list} role="list">
        {contacts.map((contact) => {
          const count = messages.filter((m) => m.contactId === contact.id).length;
          return (
            <li key={contact.id}>
              <ContactRow
                contact={contact}
                showHandle={template === 'twitter'}
                isGroup={isGroup}
                isLast={contacts.length === 1}
                messageCount={count}
              />
            </li>
          );
        })}
      </ul>

      <Button
        variant="outline"
        size="md"
        leftIcon={<LuPlus size={16} />}
        className={styles.addButton}
        disabled={!canAdd}
        onClick={handleAdd}
      >
        Add contact
      </Button>

      {!canAdd && <p className={styles.cap}>Maximum of {MAX_CONTACTS} contacts per chat.</p>}
    </div>
  );
}