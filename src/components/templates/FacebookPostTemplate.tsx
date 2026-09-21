import { memo } from 'react';
import type { ChatConfig, Contact } from '../../types';
import { cssVars } from '../../lib/cn';
import { Avatar } from './shared/Avatar';
import {
  FaBars,
  FaBell,
  FaFacebook,
  FaHouse,
  FaMagnifyingGlass,
  FaPlay,
  FaStore,
  FaThumbsUp,
  FaUserGroup,
  IoChatbubbleOutline,
  IoGlobeOutline,
  IoShareOutline,
  RiVerifiedBadgeFill,
} from './shared/icons';
import { useTemplateData } from './shared/useTemplateData';
import styles from './FacebookPostTemplate.module.css';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Roboto, 'Noto Sans', sans-serif";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function FacebookPostView({ config }: { config: ChatConfig }) {
  const data = useTemplateData(config);
  const dark = config.darkMode;
  const [post, ...comments] = config.messages;
  const contactsById = new Map(config.contacts.map((c) => [c.id, c]));
  const count = Math.max(config.messages.length, 1);

  const likes = 120 + count * 43;
  const shares = Math.round(likes / 9);

  return (
    <div
      className={styles.root}
      data-mode={dark ? 'dark' : 'light'}
      style={cssVars({ '--template-font': FONT })}
    >
     

      <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.head}>
          <Avatar name={data.self.name} seed={data.self.id} avatarUrl={data.self.avatarUrl} size={40} />
          <span className={styles.headMeta}>
            <span className={styles.name}>
              {data.self.name}
              {data.self.isVerified && (
                <RiVerifiedBadgeFill size={15} color="#1877F2" aria-hidden="true" />
              )}
            </span>
            <span className={styles.meta}>6h · <IoGlobeOutline size={12} /></span>
          </span>
          <span className={styles.more} aria-hidden="true">
            •••
          </span>
        </div>

        <div className={styles.body}>
          {post && post.text.trim() ? (
            <p className={styles.postText} dir="auto">
              {post.text}
            </p>
          ) : (
            <p className={styles.placeholder}>
              Write a message — the first one is the post body, the rest become comments.
            </p>
          )}
        </div>

        <div className={styles.summary}>
          <span>❤️ {formatCount(likes)}</span>
          <span>
            {comments.length > 0 ? `${comments.length} comments` : ''}
            {comments.length > 0 && shares > 0 ? ' · ' : ''}
            {shares > 0 ? `${formatCount(shares)} shares` : ''}
          </span>
        </div>

        <div className={styles.actions}>
          <span className={styles.action}>
            <FaThumbsUp size={15} />
            <span>Like</span>
          </span>
          <span className={styles.action}>
            <IoChatbubbleOutline size={15} />
            <span>Comment</span>
          </span>
          <span className={styles.action}>
            <IoShareOutline size={15} />
            <span>Share</span>
          </span>
        </div>

        {comments.length > 0 && (
          <div className={styles.comments}>
            {comments.map((m) => (
              <CommentRow key={m.id} contact={contactsById.get(m.contactId)} text={m.text} />
            ))}
          </div>
        )}

<div className={styles.replyBar}>
          <Avatar name={data.self.name} seed={data.self.id} avatarUrl={data.self.avatarUrl} size={32} />
          <span className={styles.replyPill}>Write a comment…</span>
        </div>
      </div>
      </div>

      
    </div>
  );
}

function CommentRow({ contact, text }: { contact: Contact | undefined; text: string }) {
  const name = contact?.name ?? 'Friend';
  return (
    <div className={styles.comment}>
      <Avatar name={name} seed={contact?.id ?? name} avatarUrl={contact?.avatarUrl} size={32} />
      <span className={styles.commentBody}>
        <span className={styles.bubble}>
          <span className={styles.commentName}>
            {name}
            {contact?.isVerified && (
              <RiVerifiedBadgeFill size={13} color="#1877F2" aria-hidden="true" />
            )}
          </span>
          <span className={styles.commentText} dir="auto">
            {text}
          </span>
        </span>
        <span className={styles.commentActions}>Like · Reply · 2d</span>
      </span>
    </div>
  );
}

const memoized = memo(FacebookPostView);
export default memoized;