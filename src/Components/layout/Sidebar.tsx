import {
  Activity,
  Bot,
  CalendarClock,
  ChartNoAxesCombined,
  ChevronRight,
  Clock3,
  LayoutDashboard,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import KinoraLogo from "../branding/KinoraLogo";

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const navigationItems: NavigationItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, description: "Your dashboard" },
  { id: "analytics", label: "Analytics", icon: ChartNoAxesCombined, description: "Your message and contact totals" },
  { id: "agents", label: "My agents", icon: Bot, description: "Manage your messaging agents" },
  { id: "contacts", label: "Contacts", icon: UsersRound, description: "Your important people" },
  { id: "schedule", label: "Schedule", icon: CalendarClock, description: "Upcoming messages" },
  { id: "history", label: "History", icon: Clock3, description: "Message history" },
];

interface SidebarProps {
  onNavigate?: () => void;
  activeSection: string;
}

function Sidebar({ onNavigate, activeSection }: SidebarProps) {
  return (
    <aside className="sidebar-shell app-transition sticky top-0 flex h-screen min-h-screen w-[272px] shrink-0 flex-col overflow-y-auto border-r border-[var(--app-border)] bg-[var(--app-surface)] px-4 py-6 sm:px-5">
      <a href="#overview" aria-label="Kinora home" className="mb-8 rounded-lg px-2 py-1.5 outline-none">
        <KinoraLogo size={48} showTagline />
      </a>

      <div className="mb-3 flex items-center justify-between px-3">
        <p className="text-xs font-medium text-[var(--app-text-muted)]">Workspace</p>
        <Activity size={15} strokeWidth={1.8} className="text-[var(--app-accent)]" aria-hidden="true" />
      </div>

      <nav aria-label="Main navigation" className="flex flex-col gap-1.5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a key={item.label} href={`#${item.id}`} onClick={onNavigate} aria-current={isActive ? "page" : undefined} title={item.description}
              className={`nav-item group relative flex items-center gap-3 overflow-hidden px-3 py-2 text-sm ${isActive ? "is-active font-medium text-[var(--app-primary)]" : "font-normal text-[var(--app-text-muted)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text)]"}`}>
              <span className={`nav-icon-tile flex shrink-0 items-center justify-center ${isActive ? "is-current text-[var(--app-accent)]" : "text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]"}`}>
                <Icon className="nav-glyph" size={17} strokeWidth={1.7} />
              </span>
              <span className="min-w-0 flex-1">{item.label}</span>
              {isActive && <ChevronRight size={15} strokeWidth={2} aria-hidden="true" className="text-[var(--app-accent)]" />}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="sidebar-note relative overflow-hidden rounded-2xl border border-[var(--app-border)] p-4">
          <div className="relative">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--app-surface-secondary)] text-[var(--app-accent)]"><UsersRound size={16} strokeWidth={1.7} /></div>
            <p className="text-sm font-medium text-[var(--app-text)]">Keep your circle close</p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--app-text-muted)]">Remember the people and moments you want to return to.</p>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-[var(--app-text-muted)]">Kinora · Personal messages</p>
      </div>
    </aside>
  );
}

export default Sidebar;
