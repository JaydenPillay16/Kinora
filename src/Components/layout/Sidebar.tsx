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

interface NavigationItem {
  label: string;
  icon: LucideIcon;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    description: "Your dashboard",
  },
  {
    label: "My Agents",
    icon: Bot,
    description: "Manage your AI agents",
  },
  {
    label: "Contacts",
    icon: UsersRound,
    description: "Your important people",
  },
  {
    label: "Schedule",
    icon: CalendarClock,
    description: "Upcoming messages",
  },
  {
    label: "History",
    icon: Clock3,
    description: "Past activity",
  },
  {
    label: "Analytics",
    icon: ChartNoAxesCombined,
    description: "Insights and performance",
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="app-transition flex min-h-screen w-64 shrink-0 flex-col border-r border-[var(--app-border)] bg-[var(--app-surface)] p-4 sm:p-5">
      {/* Brand */}
      <a
        href="#"
        aria-label="Kinora home"
        className="group mb-10 flex items-center gap-3 rounded-xl px-2 py-2"
      >
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#065F46] text-white shadow-lg shadow-emerald-950/10 transition-transform duration-300 group-hover:scale-105 dark:bg-[#34D399] dark:text-[#0B1713]">
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
          />
          <span className="relative text-2xl font-bold tracking-tighter">
            k
          </span>
        </span>

        <span className="min-w-0">
          <span className="block text-xl font-bold tracking-tight text-[var(--app-text)]">
            kinora<span className="text-[var(--app-accent)]">.</span>
          </span>
          <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.17em] text-[var(--app-text-muted)]">
            Stay close to what matters
          </span>
        </span>
      </a>

      {/* Workspace navigation */}
      <div className="mb-3 flex items-center justify-between px-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--app-text-muted)]">
          Workspace
        </p>
        <Activity
          size={14}
          strokeWidth={1.8}
          className="text-[var(--app-text-muted)]"
          aria-hidden="true"
        />
      </div>

      <nav aria-label="Main navigation" className="flex flex-col gap-1">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === 0;

          return (
            
<a
  key={item.label}
  href="#"
  onClick={onNavigate}
  aria-current={isActive ? "page" : undefined}
  title={item.description}
  className={`app-transition group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-sm ${
    isActive
      ? "bg-[var(--app-surface-secondary)] font-semibold text-[var(--app-primary)]"
      : "font-medium text-[var(--app-text-muted)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text)]"
  }`}
>

              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[var(--app-accent)]"
                />
              )}

              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-[var(--app-surface)] text-[var(--app-accent)] shadow-sm"
                    : "text-[var(--app-text-muted)] group-hover:bg-[var(--app-surface)] group-hover:text-[var(--app-accent)]"
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>

              <span className="min-w-0 flex-1">{item.label}</span>

              {isActive && (
                <ChevronRight
                  size={15}
                  strokeWidth={2}
                  aria-hidden="true"
                  className="text-[var(--app-accent)]"
                />
              )}
            </a>
          );
        })}
      </nav>

      {/* Bottom brand panel */}
      <div className="mt-auto pt-8">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)] p-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--app-accent)] opacity-[0.08] blur-2xl"
          />

          <div className="relative">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--app-surface)] text-[var(--app-accent)] shadow-sm">
              <UsersRound size={18} strokeWidth={1.8} />
            </div>

            <p className="text-sm font-semibold tracking-tight text-[var(--app-text)]">
              Make time for your people.
            </p>

            <p className="mt-1.5 text-xs leading-5 text-[var(--app-text-muted)]">
              Small moments. Meaningful connections. A little more intention
              every day.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--app-accent)]" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--app-text-muted)]">
                Stay close to what matters
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] font-medium tracking-wide text-[var(--app-text-muted)]">
          KINORA · YOUR PERSONAL SPACE
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;
