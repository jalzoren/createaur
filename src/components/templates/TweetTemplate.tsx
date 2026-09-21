import { memo } from 'react';
import type { ChatConfig, Contact, Message } from '../../types';
import { cssVars } from '../../lib/cn';
import { Avatar } from './shared/Avatar';
import {
  IoBookmarkOutline,
  IoChatbubbleEllipsesOutline,
  IoEyeOutline,
  IoGlobeOutline,
  IoHeart,
  IoRepeatOutline,
  IoShareOutline,
  IoSparklesOutline,
  RiVerifiedBadgeFill,
} from './shared/icons';
import { useTemplateData } from './shared/useTemplateData';
import styles from './TweetTemplate.module.css';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Roboto, 'Noto Sans', sans-serif";

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
}

function TweetView({ config }: { config: ChatConfig }) {
  const data = useTemplateData(config);
  const text = config.messages[0]?.text ?? '';
  const count = Math.max(config.messages.length, 1);

  const likes = 120 + count * 47;
  const reposts = Math.round(likes / 5);
  const replies = Math.round(likes / 9);
  const views = likes * 13;

  const replyMessages = config.messages.slice(1);
  const contactsById = new Map(config.contacts.map((c) => [c.id, c]));

  const replyingTo = (i: number): string => {
    const parent = i === 0 ? config.messages[0] : replyMessages[i - 1];
    const sender = parent ? contactsById.get(parent.contactId) : undefined;
    return sender?.handle?.replace(/^@/, '') ?? sender?.name ?? '';
  };

  return (
    <div
      className={styles.root}
      data-xtheme={config.xTheme}
      style={cssVars({ '--template-font': FONT })}
    >
      <div className={styles.topbar}>
        <span className={styles.topbarSide} aria-hidden="true">
          <Avatar name={data.self.name} seed={data.self.id} avatarUrl={data.self.avatarUrl} size={28} />
        </span>
        <span className={styles.topbarTitle}>Home</span>
        <span className={styles.topbarSide} aria-hidden="true">
          <IoSparklesOutline size={18} />
        </span>
      </div>

      <div className={styles.tabs}>
        <span className={styles.tab} data-active="true">
          For you
        </span>
        <span className={styles.tab}>Following</span>
      </div>

      <div className={styles.card}>
        <div className={styles.author}>
          <Avatar name={data.self.name} seed={data.self.id} avatarUrl={data.self.avatarUrl} size={40} />
          <span className={styles.authorMeta}>
            <span className={styles.authorName}>
              {data.self.name}
              {data.self.isVerified && (
                <RiVerifiedBadgeFill size={16} color="#1D9BF0" aria-hidden="true" />
              )}
            </span>
            <span className={styles.authorHandle}>{data.self.handle}</span>
          </span>
          <span className={styles.timeBadge}>
            <span>{'6h'}</span>
            <IoGlobeOutline size={14} />
          </span>
        </div>

        <div className={styles.body}>
          {text.trim() ? (
            <p className={styles.tweetText} dir="auto">
              {text}
            </p>
          ) : (
            <p className={styles.placeholder}>Write a tweet — it's rendered here in the feed.</p>
          )}
        </div>

        <div className={styles.metrics}>
          <Metric icon={<IoChatbubbleEllipsesOutline size={18} />} value={formatCount(replies)} />
          <Metric icon={<IoRepeatOutline size={18} />} value={formatCount(reposts)} />
          <Metric icon={<IoHeart size={18} />} value={formatCount(likes)} />
          <Metric icon={<IoEyeOutline size={18} />} value={`${formatCount(views)} Views`} />
          <span className={styles.metricPair}>
            <IoBookmarkOutline size={18} />
            <IoShareOutline size={18} />
          </span>
        </div>

        <div className={styles.footer}>
          <span>
            {config.time} · {config.dateLabel}
          </span>
          <span>{formatCount(views)} Views</span>
        </div>
      </div>

      {replyMessages.length > 0 && (
        <div className={styles.replies}>
          {replyMessages.map((m, i) => (
            <ReplyCard
              key={m.id}
              message={m}
              contact={contactsById.get(m.contactId)}
              index={i}
              level={i + 1}
              replyingTo={replyingTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReplyCard({
  message,
  contact,
  index,
  level,
  replyingTo,
}: {
  message: Message;
  contact: Contact | undefined;
  index: number;
  level: number;
  replyingTo: string;
}) {
  const name = contact?.name ?? 'User';
  const handle = contact?.handle ?? '';
  const text = message.text.trim();

  const likes = 21 + index * 9;
  const reposts = Math.round(likes / 6);
  const replies = Math.round(likes / 8);
  const views = likes * 9;

  return (
    <div
      className={styles.replyCard}
      style={cssVars({ '--reply-level': level })}
    >
      {replyingTo && (
        <span className={styles.replyTo}>
          Replying to <span className={styles.replyToLink}>@{replyingTo}</span>
        </span>
      )}
      <div className={styles.author}>
        <Avatar name={name} seed={contact?.id ?? name} avatarUrl={contact?.avatarUrl} size={40} />
        <span className={styles.authorMeta}>
          <span className={styles.authorName}>
            {name}
            {contact?.isVerified && (
              <RiVerifiedBadgeFill size={16} color="#1D9BF0" aria-hidden="true" />
            )}
          </span>
          <span className={styles.authorHandle}>
            {handle ? `${handle} · ` : ''}
            {replyTime(index)}
          </span>
        </span>
      </div>
      {text && (
        <div className={styles.body}>
          <p className={styles.tweetText} dir="auto">
            {message.text}
          </p>
        </div>
      )}
      <div className={styles.metrics}>
        <Metric icon={<IoChatbubbleEllipsesOutline size={18} />} value={formatCount(replies)} />
        <Metric icon={<IoRepeatOutline size={18} />} value={formatCount(reposts)} />
        <Metric icon={<IoHeart size={18} />} value={formatCount(likes)} />
        <Metric icon={<IoEyeOutline size={18} />} value={`${formatCount(views)} Views`} />
        <span className={styles.metricPair}>
          <IoBookmarkOutline size={18} />
          <IoShareOutline size={18} />
        </span>
      </div>
    </div>
  );
}

function replyTime(index: number): string {
  const minutes = 95 + index * 63;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return '1d';
}

function Metric({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <span className={styles.metric}>
      {icon}
      <span className={styles.metricValue}>{value}</span>
    </span>
  );
}

const memoized = memo(TweetView);
export default memoized;