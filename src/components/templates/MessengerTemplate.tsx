import { memo } from 'react';
import type { ChatConfig, Contact } from '../../types';
import { cssVars } from '../../lib/cn';
import type { MessageGroup } from '../../lib/groupMessages';
import { Avatar } from './shared/Avatar';
import { StatusBar } from './shared/StatusBar';
import {
  FaCamera,
  FaChevronLeft,
  FaCircleCheck,
  FaFaceSmile,
  FaPhone,
  FaThumbsUp,
  FaVideo,
} from './shared/icons';
import { useTemplateData } from './shared/useTemplateData';
import styles from './MessengerTemplate.module.css';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, 'Inter Variable', Inter, sans-serif";

function MessengerView({ config }: { config: ChatConfig }) {
  const data = useTemplateData(config);
  const dark = config.darkMode;
  const contactsById = new Map(config.contacts.map((c) => [c.id, c]));

  const firstOther = data.firstOther;
  const online = firstOther?.isOnline;

  const rootVars = cssVars({
    '--template-font': FONT,
    '--wallpaper': data.wallpaper,
    '--nav-bg': dark ? '#242526' : '#ffffff',
    '--hairline': dark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.08)',
    '--bubble-in': dark ? '#3A3B3C' : '#F0F2F5',
    '--bubble-in-text': dark ? '#ffffff' : '#050505',
    '--meta': dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
    '--time-color': dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)',
  });

  return (
    <div className={styles.root} data-mode={dark ? 'dark' : 'light'} style={rootVars}>
      {config.showStatusBar && (
        <StatusBar
          time={config.time}
          battery={config.battery}
          signalBars={config.signalBars}
          carrier={config.carrier || undefined}
          color={dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)'}
        />
      )}

      <div className={styles.nav}>
        <span className={styles.navLeft}>
          <FaChevronLeft size={20} color="#0084FF" aria-hidden="true" />
        </span>
        <span className={styles.navAvatar}>
          <Avatar
            name={firstOther?.name ?? ''}
            seed={firstOther?.id ?? ''}
            avatarUrl={firstOther?.avatarUrl}
            size={36}
          />
          {online && <span className={styles.activeDot} aria-hidden="true" />}
        </span>
        <span className={styles.navCopy}>
          <span className={styles.navName}>{data.title}</span>
          <span className={styles.navSubtitle}>{online ? 'Active now' : data.subtitle}</span>
        </span>
        <span className={styles.navRight}>
          <FaPhone size={20} color="#0084FF" aria-hidden="true" />
          <FaVideo size={22} color="#0084FF" aria-hidden="true" />
        </span>
      </div>

      <div className={styles.chat}>
        {data.groups.map((group) => (
          <GroupRow
            key={groupKey(group)}
            group={group}
            contact={contactsById.get(group.contactId)}
            selfContact={data.self}
            isLastSelfGroup={group.messages[group.messages.length - 1]?.message.id === data.lastSelfMessageId}
          />
        ))}
        {data.groups.length === 0 && <div className={styles.empty} aria-hidden="true" />}
      </div>

      <div className={styles.inputBar}>
        <span className={styles.circle}>
          <FaCamera size={20} aria-hidden="true" />
        </span>
        <span className={styles.field}>Aa</span>
        <FaFaceSmile size={24} color="#0084FF" aria-hidden="true" />
        <FaThumbsUp size={22} color="#0084FF" aria-hidden="true" />
      </div>
    </div>
  );
}

function groupKey(group: MessageGroup): string {
  return `${group.contactId}-${group.messages[0]?.message.id ?? ''}`;
}

function GroupRow({
  group,
  contact,
  selfContact,
  isLastSelfGroup,
}: {
  group: MessageGroup;
  contact: Contact | undefined;
  selfContact: Contact;
  isLastSelfGroup: boolean;
}) {
  const self = group.isSelf;
  const lastSelf = group.messages[group.messages.length - 1]?.message;
  const senderName = !self ? (contact?.name ?? '') : '';

  return (
    <div className={styles.groupBlock}>
      {group.timeLabel && (
        <div className={styles.timeLabel} aria-hidden="true">
          {group.timeLabel}
        </div>
      )}
      {!self && <div className={styles.senderName}>{senderName}</div>}
      {group.messages.map((item) => (
        <div
          key={item.message.id}
          className={styles.row}
          data-self={self ? 'true' : undefined}
          data-first={item.isFirst ? 'true' : undefined}
          data-last={item.isLast ? 'true' : undefined}
        >
          <span className={styles.gutter}>
            {!self && item.isLast && contact && (
              <Avatar name={contact.name} seed={contact.id} avatarUrl={contact.avatarUrl} size={28} />
            )}
          </span>
          <span className={styles.bubbleWrap}>
            <span
              className={styles.bubble}
              dir="auto"
              data-self={self ? 'true' : undefined}
              data-first={item.isFirst ? 'true' : undefined}
              data-last={item.isLast ? 'true' : undefined}
            >
              {item.message.text}
            </span>
            {item.message.reaction && (
              <span
                className={styles.reaction}
                data-self={self ? 'true' : undefined}
              >
                {item.message.reaction.emoji}
              </span>
            )}
          </span>
        </div>
      ))}
      {self && isLastSelfGroup && (
        <div className={styles.receipt}>
          {lastSelf?.isRead ? (
            <span className={styles.readAvatar}>
              <Avatar name={selfContact.name} seed={selfContact.id} avatarUrl={selfContact.avatarUrl} size={14} />
            </span>
          ) : (
            <FaCircleCheck size={15} color="#0084FF" aria-hidden="true" />
          )}
        </div>
      )}
    </div>
  );
}

export default memo(MessengerView);