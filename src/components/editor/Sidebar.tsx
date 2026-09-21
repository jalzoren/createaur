import type { ReactNode } from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useUiStore } from '../../store/useUiStore';
import type { EditorTab, SheetSnap } from '../../store/useUiStore';
import { LuChevronDown, LuLayoutTemplate, LuMessagesSquare, LuPalette, LuUsers, LuX } from '../ui/icons';
import { TemplatePicker } from './TemplatePicker';
import { ContactEditor } from './ContactEditor';
import { MessageEditor } from './MessageEditor';
import { StylePanel } from './StylePanel';
import styles from './Sidebar.module.css';

const TABS: { id: EditorTab; label: string; icon: ReactNode }[] = [
  { id: 'messages', label: 'Messages', icon: <LuMessagesSquare size={16} /> },
  { id: 'contacts', label: 'Contacts', icon: <LuUsers size={16} /> },
  { id: 'template', label: 'Template', icon: <LuLayoutTemplate size={16} /> },
  { id: 'style', label: 'Style', icon: <LuPalette size={16} /> },
];

export function Sidebar() {
  const isTabletUp = useMediaQuery('(min-width: 1024px)');
  if (isTabletUp) return <DesktopSidebar />;
  return <MobileSheet />;
}

function Panel({ tab }: { tab: EditorTab }) {
  switch (tab) {
    case 'template':
      return <TemplatePicker />;
    case 'contacts':
      return <ContactEditor />;
    case 'style':
      return <StylePanel />;
    case 'messages':
    default:
      return <MessageEditor />;
  }
}

function TabNav({ onSelect }: { onSelect?: (tab: EditorTab) => void }) {
  const activeTab = useUiStore((s) => s.activeTab);
  const setActiveTab = useUiStore((s) => s.setActiveTab);
  return (
    <nav className={styles.nav} aria-label="Editor sections">
      {TABS.map((tab) => {
        const selected = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={styles.navItem}
            data-selected={selected ? 'true' : undefined}
            aria-current={selected ? 'page' : undefined}
            onClick={() => {
              setActiveTab(tab.id);
              onSelect?.(tab.id);
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function DesktopSidebar() {
  const activeTab = useUiStore((s) => s.activeTab);
  return (
    <aside className={styles.desktop}>
      <header className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Edit</h2>
      </header>
      <TabNav />
      <div className={styles.panel}>
        <Panel tab={activeTab} />
      </div>
    </aside>
  );
}

const SNAP_HEIGHT: Record<SheetSnap, string> = {
  collapsed: '10%',
  half: '52%',
  full: '92%',
};

function MobileSheet() {
  const snap = useUiStore((s) => s.sheetSnap);
  const activeTab = useUiStore((s) => s.activeTab);
  const setSheetSnap = useUiStore((s) => s.setSheetSnap);
  const cycleSheetSnap = useUiStore((s) => s.cycleSheetSnap);

  const open = snap !== 'collapsed';

  return (
    <div className={styles.sheetWrap} data-open={open ? 'true' : undefined}>
      <div
        className={styles.backdrop}
        onClick={() => setSheetSnap('collapsed')}
        aria-hidden="true"
      />
      <section className={styles.sheet} style={{ height: SNAP_HEIGHT[snap] }} data-snap={snap}>
        <button
          type="button"
          className={styles.swipeHandle}
          aria-label="Resize the editing panel"
          onClick={cycleSheetSnap}
        >
          <span className={styles.swipePill} aria-hidden="true" />
        </button>
        <header className={styles.sheetHeader}>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Close editor"
            onClick={() => setSheetSnap('collapsed')}
          >
            <LuX size={18} aria-hidden="true" />
          </button>
          <span className={styles.sheetTitle}>
            Edit — {TABS.find((t) => t.id === activeTab)?.label}
          </span>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Expand editor"
            onClick={() => setSheetSnap('full')}
          >
            <LuChevronDown size={18} aria-hidden="true" />
          </button>
        </header>
        <div className={styles.sheetTabs}>
          <TabNav onSelect={() => setSheetSnap('half')} />
        </div>
        <div className={styles.sheetBody}>
          <Panel tab={activeTab} />
        </div>
      </section>
    </div>
  );
}