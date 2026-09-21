// Central icon + glyph map for chat templates. react-icons come from the
// Ionicons 5 (and a few Material) sub-packages; everything else is a hand
// written inline SVG so it survives html-to-image export.
import {
  IoAdd,
  IoArrowBack,
  IoAttach,
  IoBookmarkOutline,
  IoCall,
  IoCamera,
  IoChatbubbleEllipsesOutline,
  IoChatbubbleOutline,
  IoCheckmarkDone,
  IoChevronBack,
  IoEllipsisVertical,
  IoEyeOutline,
  IoGlobeOutline,
  IoHappyOutline,
  IoHeart,
  IoHeartOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoMic,
  IoRepeatOutline,
  IoSend,
  IoShareOutline,
  IoSparklesOutline,
  IoThumbsUp,
  IoVideocam,
  IoWifi,
} from 'react-icons/io5';
import {
  FaBars,
  FaBell,
  FaCamera,
  FaChevronLeft,
  FaCircleCheck,
  FaEllipsis,
  FaFaceSmile,
  FaHouse,
  FaImage,
  FaMagnifyingGlass,
  FaPaperPlane,
  FaPhone,
  FaPlay,
  FaStore,
  FaThumbsUp,
  FaUserGroup,
  FaVideo,
} from 'react-icons/fa6';
import { FaFacebook, FaFacebookMessenger } from 'react-icons/fa';
import { RiVerifiedBadgeFill } from 'react-icons/ri';

export {
  IoAdd,
  IoArrowBack,
  IoAttach,
  IoBookmarkOutline,
  IoCall,
  IoCamera,
  IoChatbubbleEllipsesOutline,
  IoChatbubbleOutline,
  IoCheckmarkDone,
  IoChevronBack,
  IoEllipsisVertical,
  IoEyeOutline,
  IoGlobeOutline,
  IoHappyOutline,
  IoHeart,
  IoHeartOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoMic,
  IoRepeatOutline,
  IoSend,
  IoShareOutline,
  IoSparklesOutline,
  IoThumbsUp,
  IoVideocam,
  IoWifi,
  FaBars,
  FaBell,
  FaCamera,
  FaChevronLeft,
  FaCircleCheck,
  FaEllipsis,
  FaFacebook,
  FaFacebookMessenger,
  FaFaceSmile,
  FaHouse,
  FaImage,
  FaMagnifyingGlass,
  FaPaperPlane,
  FaPhone,
  FaPlay,
  FaStore,
  FaThumbsUp,
  FaUserGroup,
  FaVideo,
  RiVerifiedBadgeFill,
};

/** 4-bar iOS signal strength indicator. */
export function SignalBars({
  bars,
  color = 'currentColor',
  size = 18,
}: {
  bars: 0 | 1 | 2 | 3 | 4;
  color?: string;
  size?: number;
}) {
  const heights = [5, 7.5, 10, 12];
  return (
    <svg
      width={size}
      height={size * 0.68}
      viewBox="0 0 18 12"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {heights.map((h, i) => {
        const active = i < bars;
        return (
          <rect
            key={i}
            x={0.5 + i * 4.3}
            y={12 - h}
            width={3.1}
            height={h}
            rx={1}
            fill={active ? color : 'none'}
            stroke={active ? 'none' : color}
            strokeOpacity={0.45}
            strokeWidth={1}
          />
        );
      })}
    </svg>
  );
}

/** iOS battery indicator. Fill turns red at <= 20%. */
export function Battery({
  level,
  color = 'currentColor',
  size = 26,
}: {
  level: number;
  color?: string;
  size?: number;
}) {
  const clamped = Math.min(100, Math.max(0, level));
  const low = clamped <= 20;
  const fillColor = low ? '#FF3B30' : color;
  const fillW = (21 - 4) * (clamped / 100);
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 25 12"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect
        x={0.5}
        y={0.5}
        width={21}
        height={11}
        rx={3.5}
        fill="none"
        stroke={color}
        strokeOpacity={0.4}
        strokeWidth={1}
      />
      <rect x={2.5} y={2.5} width={fillW} height={7} rx={1.8} fill={fillColor} />
      <rect x={22.5} y={3.5} width={2.4} height={5} rx={1} fill={color} opacity={0.8} />
    </svg>
  );
}

/** iOS home indicator pill. */
export function HomeIndicator({ color = '#000000' }: { color?: string }) {
  return (
    <svg
      width={134}
      height={5}
      viewBox="0 0 134 5"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <rect width={134} height={5} rx={2.5} fill={color} opacity={0.9} />
    </svg>
  );
}

/** WhatsApp single message tick (not yet read). */
export function SingleCheck({ color = '#8696A0', size = 16 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.7}
      viewBox="0 0 16 11"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <path
        d="M1 5.5 L5 9.5 L13 1.5"
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The bubble tail glyphs only exist as CSS elements; this is kept as a shared
 * color type so templates agree on the shape of their per-bubble variables. */
export type BubbleVars = {
  '--bubble': string;
  '--bubble-text': string;
  '--bubble-tail': string;
};