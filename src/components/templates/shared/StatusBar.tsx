import { cssVars } from '../../../lib/cn';
import { Battery, IoWifi, SignalBars } from './icons';
import styles from './StatusBar.module.css';

export interface StatusBarProps {
  time: string;
  battery: number;
  signalBars: 0 | 1 | 2 | 3 | 4;
  carrier?: string;
  color?: string;
}

/**
 * An iOS-style status bar (47px): centered time on the left, carrier + signal
 * cluster on the right.
 */
export function StatusBar({
  time,
  battery,
  signalBars,
  carrier,
  color = 'rgba(0,0,0,0.92)',
}: StatusBarProps) {
  return (
    <div className={styles.root} style={cssVars({ '--sb-color': color })}>
      <span className={styles.time} aria-hidden="true">
        {time}
      </span>
      <span className={styles.right}>
        {carrier && <span className={styles.carrier}>{carrier}</span>}
        <span className={styles.signal}>
          <SignalBars bars={signalBars} color={color} size={18} />
        </span>
        <IoWifi size={16} color={color} aria-hidden="true" />
        <span className={styles.battery}>
          <Battery level={battery} color={color} size={26} />
        </span>
      </span>
    </div>
  );
}