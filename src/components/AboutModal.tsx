import { Modal } from './ui';
import styles from './AboutModal.module.css';

export interface AboutModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: '⌘/Ctrl + ⏎', label: 'Insert a new message from a textarea' },
  { keys: '⌘/Ctrl + E', label: 'Export PNG' },
  { keys: '⌘/Ctrl + ⇧ + C', label: 'Copy PNG to clipboard' },
  { keys: '?', label: 'Show this dialog' },
];

const FEATURES: { title: string; body: string }[] = [
  {
    title: 'Five template families',
    body: 'Render believable iMessage, Messenger, X (Twitter) chats, an X posted tweet and a Facebook post from data you control.',
  },
  {
    title: 'Perfectly faithful',
    body: 'System fonts, correct paddings, status bars, receipts, reactions and gradients — tuned per platform.',
  },
  {
    title: 'Screenshot-sharp export',
    body: 'Export at 1×, 2× or 3× in CSS pixels. Tall chats auto-scale below 3× to fit browser memory.',
  },
  {
    title: 'Your own people',
    body: 'Add up to eight contacts with custom names, avatars, handles and bubble colors.',
  },
  {
    title: 'Copies as PNG',
    body: 'Copy straight to the clipboard on supported browsers and paste into a message or document.',
  },
  {
    title: 'Stays on your device',
    body: 'Every pixel is rendered locally — nothing is uploaded, and your project autosaves to this browser.',
  },
];

export function AboutModal({ open, onClose }: AboutModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="About CreateAUR" size="md">
      <div className={styles.body}>
        <p className={styles.tagline}>
          Fake screenshots, taken seriously. Craft realistic chat screenshots for your favorite
          messaging apps.
        </p>

        <p className={styles.sectionTitle}>Templates</p>
        <ul className={styles.list}>
          <li>iMessage — bubbles, reactions, receipts, timed status bar</li>
          <li>Facebook Messenger — reactions, verified badges, "Active now"</li>
          <li>X (Twitter) — reply threads, left rail, verified checkmarks</li>
          <li>X · Post — posted tweet with metrics in Light/Dim/Dark themes</li>
          <li>Facebook Post — status update with likes, comments and a reply bar</li>
        </ul>

        <p className={styles.sectionTitle}>Shortcuts</p>
        <ul className={styles.shortcuts}>
          {SHORTCUTS.map((s) => (
            <li key={s.keys}>
              <kbd className={styles.kbd}>{s.keys}</kbd>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>

        <p className={styles.sectionTitle}>Why it feels right</p>
        <ul className={styles.list}>
          {FEATURES.map((f) => (
            <li key={f.title}>
              <strong>{f.title}.</strong> {f.body}
            </li>
          ))}
        </ul>

        <p className={styles.footer}>
          CreateAUR is a parody/demo tool. Any resemblance to real people in your screenshots is up
          to you — keep it classy.
        </p>
      </div>
    </Modal>
  );
}