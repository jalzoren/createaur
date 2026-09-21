import { memo } from 'react';
import type { ChatConfig, Contact } from '../../types';
import { cssVars } from '../../lib/cn';
import { hexToRgba } from '../../lib/color';
import type { GroupedMessage, MessageGroup } from '../../lib/groupMessages';
import { Avatar } from './shared/Avatar';
import { StatusBar } from './shared/StatusBar';
import { HomeIndicator, IoAdd, IoChevronBack, IoMic } from './shared/icons';
import { useTemplateData } from './shared/useTemplateData';
import styles from './IMessageTemplate.module.css';

function IMessageView({ config }: { config: ChatConfig }) {
  const data = useTemplateData(config);
  const dark = config.darkMode;
  const contactsById = new Map(config.contacts.map((c) => [c.id, c]));

  const statusColor = dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.92)';
  const incomingColor = '#8E8E93';

  const rootVars = cssVars({
    '--template-font': TEMPLATE_FONT,
    '--wallpaper': data.wallpaper,
    '--bubble-opacity': config.bubbleOpacity,
    '--incoming-bg': incomingColor,
    '--nav-bg': dark ? '#1C1C1E' : '#F9F9F9',
    '--hairline': dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
    '--nav-name': dark ? '#9E9E9E' : '#545354',
    '--status-secondary': dark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)',
    '--react-bg': dark ? '#3A3A3C' : '#F2F2F7',
  });

  return (
    <div className={styles.root} data-mode={dark ? 'dark' : 'light'} style={rootVars}>
      {config.showStatusBar && (
        <StatusBar
          time={config.time}
          battery={config.battery}
          signalBars={config.signalBars}
          carrier={config.carrier}
          color={statusColor}
        />
      )}

      <div className={styles.nav}>
        <span className={styles.navLeft}>
          <IoChevronBack size={26} color="#007AFF" aria-hidden="true" />
        </span>
        <span className={styles.navCenter}>
          <span className={styles.navAvatar}>
            {data.isGroup ? (
              <span className={styles.avatarCluster}>
{data.others.slice(0, 3).map((c) => (
                    <Avatar key={c.id} name={c.name} seed={c.id} avatarUrl={c.avatarUrl} size={24} />
                  ))}
                {data.others.length !== 3 && (
                  <Avatar
                    name={data.self.name}
                    seed={data.self.id}
                    avatarUrl={data.self.avatarUrl}
                    size={24}
                  />
                )}
              </span>
            ) : (
              <Avatar
                name={data.others[0]?.name ?? ''}
                seed={data.others[0]?.id ?? ''}
                avatarUrl={data.others[0]?.avatarUrl}
                size={50}
              />
            )}
          </span>
          <span className={styles.navTitle}>{data.title}</span>
        </span>
        <span className={styles.navRight}>
        </span>
      </div>

      <div className={styles.chat}>
        {data.groups.map((group) => (
          <MessageGroupView
            key={toKey(group)}
            group={group}
            config={config}
            incomingColor={incomingColor}
            contact={contactsById.get(group.contactId)}
            showAvatars={config.showAvatars && data.isGroup}
            isGroup={data.isGroup}
            isLastSelfGroup={group.messages[group.messages.length - 1]?.message.id === data.lastSelfMessageId}
            dark={dark}
          />
        ))}
        {data.groups.length === 0 && <div className={styles.empty} aria-hidden="true" />}
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputBar}>
          <span className={styles.addButton}>
            <IoAdd size={22} aria-hidden="true" />
          </span>
          <span className={styles.textField}>iMessage</span>
          <span className={styles.micButton}>
            <IoMic size={20} aria-hidden="true" />
          </span>
        </div>
        <div className={styles.homeZone}>
          <HomeIndicator color={dark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)'} />
        </div>
      </div>
    </div>
  );
}

const TEMPLATE_FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', 'Segoe UI', Roboto, 'Inter Variable', Inter, sans-serif";

function toKey(group: { contactId: string; messages: GroupedMessage[] }): string {
  return `${group.contactId}-${group.messages[0]?.message.id ?? ''}`;
}

function MessageGroupView({
  group,
  config,
  contact,
  incomingColor,
  showAvatars,
  isGroup,
  isLastSelfGroup,
  dark,
}: {
  group: MessageGroup;
  config: ChatConfig;
  contact: Contact | undefined;
  incomingColor: string;
  showAvatars: boolean;
  isGroup: boolean;
  isLastSelfGroup: boolean;
  dark: boolean;
}) {
  const self = group.isSelf;
  const bubbleColorFor = (): string =>
    self
      ? dark
        ? '#0A84FF'
        : '#007AFF'
      : contact?.bubbleColor
        ? contact.bubbleColor
        : incomingColor;

  const receipt = useReceipt(config, isLastSelfGroup, group);

  return (
    <div className={styles.group} data-self={self ? 'true' : undefined}>
      {group.timeLabel && (
        <div className={styles.timeLabel} aria-hidden="true">
          {group.timeLabel}
        </div>
      )}
      {!self && isGroup && contact && (
        <div className={styles.senderName}>{contact.name}</div>
      )}
      {group.messages.map((item) => {
        const bubble = hexToRgba(bubbleColorFor(), config.bubbleOpacity);
        return (
          <div
            key={item.message.id}
            className={styles.row}
            data-self={self ? 'true' : undefined}
            data-first={item.isFirst ? 'true' : undefined}
            data-last={item.isLast ? 'true' : undefined}
          >
            {!self && showAvatars && (
              <span className={styles.avatarSlot}>
                {item.isLast && contact ? (
                  <Avatar name={contact.name} seed={contact.id} avatarUrl={contact.avatarUrl} size={24} />
                ) : null}
              </span>
            )}
            <div
              className={styles.bubble}
              dir="auto"
              style={cssVars({
                '--bubble-bg': bubble,
                '--bubble-text': self ? '#ffffff' : dark ? '#ffffff' : '#000000',
              })}
            >
              {item.message.text}
              {item.message.reaction && (
                <span
                  className={styles.reaction}
                  data-self={self ? 'true' : undefined}
                >
                  {item.message.reaction.emoji}
                </span>
              )}
            </div>
          </div>
        );
      })}
      {self && isLastSelfGroup && (
        <div className={styles.receipts}>
          {receipt}
        </div>
      )}
    </div>
  );
}

function useReceipt(
  config: ChatConfig,
  isLastSelfGroup: boolean,
  group: MessageGroup,
): string {
  if (!config.showReadReceipts || !isLastSelfGroup) return '';
  const last = group.messages[group.messages.length - 1]?.message;
  const time = last?.timestamp ?? config.time;
  return last?.isRead ? `Read ${time}` : 'Delivered';
}

const memoized = memo(IMessageView);
export default memoized;