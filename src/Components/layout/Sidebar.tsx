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
  { id: "agents", label: "My Agents", icon: Bot, description: "Manage your messaging agents" },
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
      <a href="#overview" aria-label="Kinora home" className="mb-10 rounded-2xl px-2 py-1.5 outline-none transition-transform duration-300 hover:translate-x-0.5">
        <KinoraLogo size={48} showTagline />
      </a>

      <div className="mb-3 flex items-center justify-between px-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--app-text-muted)]">Workspace</p>
        <Activity size={15} strokeWidth={1.8} className="text-[var(--app-accent)]" aria-hidden="true" />
      </div>

      <nav aria-label="Main navigation" className="flex flex-col gap-1.5">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <a key={item.label} href={`#${item.id}`} onClick={onNavigate} aria-current={isActive ? "page" : undefined} title={item.description}
              className={`nav-item group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-sm ${isActive ? "is-active font-semibold text-[var(--app-primary)]" : "font-medium text-[var(--app-text-muted)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text)]"}`}>
              {isActive && <span aria-hidden="true" className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[var(--app-accent)]" />}
              <span className={`nav-icon-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${isActive ? "is-current text-[var(--app-accent)]" : "text-[var(--app-text-muted)] group-hover:text-[var(--app-accent)]"}`}>
                <Icon className="nav-glyph" size={19} strokeWidth={isActive ? 2.15 : 1.85} />
              </span>
              <span className="min-w-0 flex-1">{item.label}</span>
              {isActive && <ChevronRight size={15} strokeWidth={2} aria-hidden="true" className="text-[var(--app-accent)]" />}
            </a>
          );
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="sidebar-note relative overflow-hidden rounded-2xl border border-[var(--app-border)] p-4">
          <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--app-accent)] opacity-10 blur-2xl" />
          <div className="relative">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--app-surface)] text-[var(--app-accent)] shadow-sm ring-1 ring-[var(--app-border)]"><UsersRound size={18} strokeWidth={1.8} /></div>
            <p className="text-sm font-semibold tracking-tight text-[var(--app-text)]">Make time for your people.</p>
            <p className="mt-1.5 text-xs leading-5 text-[var(--app-text-muted)]">Small moments. Meaningful connections. A little more intention every day.</p>
            <div className="mt-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)] shadow-[0_0_10px_var(--app-accent)]" /><span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--app-text-muted)]">Stay close to what matters</span></div>
          </div>
        </div>
        <p className="mt-4 text-center text-[10px] font-medium tracking-[0.12em] text-[var(--app-text-muted)]">KINORA · YOUR PERSONAL SPACE</p>
      </div>
    </aside>
  );
}

export default Sidebar;
