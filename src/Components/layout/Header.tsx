
import {
  Bell,
  ChevronRight,
  Menu,
  Sparkles,
  X,
} from "lucide-react";
import KinoraLogo from "../branding/KinoraLogo";
import ThemeToggle from "../branding/ThemeToggle";

interface HeaderProps {
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
}

function Header({ onMenuClick, isMobileMenuOpen }: HeaderProps) {
  return (
    <header className="app-transition sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface)]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label={isMobileMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMobileMenuOpen}
          className="app-transition flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] lg:hidden"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="hidden shrink-0 sm:block lg:hidden">
          <KinoraLogo size={36} />
        </div>

        <div className="min-w-0">
          <nav
            aria-label="Breadcrumb"
            className="mb-1 flex items-center gap-1.5 text-xs"
          >
            <span className="text-[var(--app-text-muted)]">Workspace</span>
            <ChevronRight size={13} aria-hidden="true" className="text-[var(--app-text-muted)]" />
            <span className="font-semibold text-[var(--app-accent)]">Overview</span>
          </nav>

          <div className="flex items-center gap-2">
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--app-text)] sm:text-xl">
              Your dashboard
            </h1>
            <Sparkles
              size={15}
              aria-hidden="true"
              className="hidden text-[var(--app-accent)] sm:block"
            />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <button
          type="button"
          aria-label="Notifications (coming soon)"
          title="Notifications"
          className="app-transition relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
        >
          <Bell size={19} strokeWidth={1.8} />
        </button>
      </div>
    </header>
  );
}

export default Header;
