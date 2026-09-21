import { memo } from 'react';
import type { ChatConfig } from '../../types';
import { cssVars } from '../../lib/cn';
import { formatTime12 } from '../../lib/time';
import type { MessageGroup } from '../../lib/groupMessages';
import { Avatar } from './shared/Avatar';
import {
  Battery,
  FaChevronLeft,
  FaEllipsis,
  FaFaceSmile,
  FaImage,
  FaPaperPlane,
  FaVideo,
  RiVerifiedBadgeFill,
  SignalBars,
} from './shared/icons';
import { useTemplateData } from './shared/useTemplateData';
import styles from './TwitterTemplate.module.css';

const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, 'Inter Variable', Inter, sans-serif";

function TwitterView({ config }: { config: ChatConfig }) {
  const data = useTemplateData(config);
  const dark = config.darkMode;
  const firstOther = data.firstOther;
  const showProfile = !data.isGroup;

  const rootVars = cssVars({
    '--template-font': FONT,
    '--wallpaper': data.wallpaper,
    '--nav-bg': dark ? '#000000' : '#ffffff',
    '--hairline': dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
    '--bubble-in': dark ? '#2F3336' : '#EFF3F4',
    '--bubble-out': '#1D9BF0',
    '--bubble-in-text': dark ? '#ffffff' : '#0F1419',
    '--bubble-out-text': '#ffffff',
    '--author': dark ? '#ffffff' : '#0F1419',
    '--muted': '#71767B',
  });

  return (
    <div className={styles.root} data-mode={dark ? 'dark' : 'light'} style={rootVars}>
      {config.showStatusBar && (
        <StatusBarCompact
          time={config.time}
          battery={config.battery}
          signalBars={config.signalBars}
          color={dark ? 'rgba(255,255,255,0.88)' : 'rgba(0,0,0,0.88)'}
        />
      )}

      <div className={styles.nav}>
        <FaChevronLeft size={20} color={dark ? '#E7E9EA' : '#0F1419'} aria-hidden="true" />
        <span className={styles.navProfile}>
          <Avatar
            name={data.title}
            seed={firstOther?.id ?? ''}
            avatarUrl={firstOther?.avatarUrl}
            size={32}
          />
          <span className={styles.navCopy}>
            <span className={styles.navNameRow}>
              <span className={styles.navName}>{data.title}</span>
              {firstOther?.isVerified && <RiVerifiedBadgeFill size={16} color="#1D9BF0" aria-hidden="true" />}
            </span>
            <span className={styles.navHandle}>{firstOther?.handle ?? data.subtitle}</span>
          </span>
        </span>
        <span className={styles.navButtons}>
          <FaVideo size={19} color={dark ? '#E7E9EA' : '#0F1419'} aria-hidden="true" />
          <FaEllipsis size={19} color={dark ? '#E7E9EA' : '#0F1419'} aria-hidden="true" />
        </span>
      </div>

      {showProfile && firstOther && (
        <div className={styles.profile}>
          <Avatar name={firstOther.name} seed={firstOther.id} avatarUrl={firstOther.avatarUrl} size={48} />
          <span className={styles.profileNameRow}>
            <span className={styles.profileName}>{firstOther.name}</span>
            {firstOther.isVerified && <RiVerifiedBadgeFill size={18} color="#1D9BF0" aria-hidden="true" />}
          </span>
          <span className={styles.profileHandle}>{firstOther.handle}</span>
          <span className={styles.profileJoined}>Joined September 2024</span>
        </div>
      )}

      <div className={styles.chat}>
        {data.groups.map((group) => (
          <GroupRow
            key={groupKey(group)}
            group={group}
            config={config}
            isLastSelfGroup={group.messages[group.messages.length - 1]?.message.id === data.lastSelfMessageId}
          />
        ))}
        {data.groups.length === 0 && <div className={styles.empty} aria-hidden="true" />}
      </div>

      <div className={styles.inputBar}>
        <FaImage size={20} color={dark ? '#E7E9EA' : '#0F1419'} aria-hidden="true" />
        <span className={styles.gifBadge}>GIF</span>
        <FaFaceSmile size={20} color={dark ? '#E7E9EA' : '#0F1419'} aria-hidden="true" />
        <span className={styles.shareField}>Start a new message</span>
        <FaPaperPlane size={20} color={dark ? '#E7E9EA' : '#0F1419'} aria-hidden="true" />
      </div>
    </div>
  );
}

function StatusBarCompact({
  time,
  battery,
  signalBars,
  color,
}: {
  time: string;
  battery: number;
  signalBars: 0 | 1 | 2 | 3 | 4;
  color: string;
}) {
  return (
    <div className={styles.statusBar} style={cssVars({ '--sb-color': color })}>
      <span className={styles.statusTime}>{time}</span>
      <span className={styles.statusRight}>
        <SignalBars bars={signalBars} color={color} />
        <Battery level={battery} color={color} />
      </span>
    </div>
  );
}

function groupKey(group: MessageGroup): string {
  return `${group.contactId}-${group.messages[0]?.message.id ?? ''}`;
}

function GroupRow({
  group,
  config,
  isLastSelfGroup,
}: {
  group: MessageGroup;
  config: ChatConfig;
  isLastSelfGroup: boolean;
}) {
  const self = group.isSelf;
  const lastSelf = group.messages[group.messages.length - 1]?.message;
  const lastTimestamp = resolveGroupTime(group, config);

  return (
    <div className={styles.groupBlock} data-self={self ? 'true' : undefined}>
      {group.messages.map((item) => (
        <div
          key={item.message.id}
          className={styles.row}
          data-self={self ? 'true' : undefined}
          data-last={item.isLast ? 'true' : undefined}
        >
          <span
            className={styles.bubble}
            dir="auto"
            data-self={self ? 'true' : undefined}
            data-last={item.isLast ? 'true' : undefined}
          >
            {item.message.text}
          </span>
          {item.message.reaction && (
            <span className={styles.reaction} data-self={self ? 'true' : undefined}>
              {item.message.reaction.emoji}
            </span>
          )}
        </div>
      ))}
      {config.showTimestamp && self && (
        <span className={styles.timestamp} data-self={self ? 'true' : undefined}>
          {lastTimestamp}
        </span>
      )}
      {self && isLastSelfGroup && (
        <span className={styles.timestamp} data-self={self ? 'true' : undefined}>
          {lastSelf?.isRead ? 'Seen' : ''}
        </span>
      )}
    </div>
  );
}

function resolveGroupTime(group: MessageGroup, config: ChatConfig): string {
  const time = group.messages[group.messages.length - 1]?.message.timestamp ?? config.time;
  return formatTime12(time);
}

export default memo(TwitterView);