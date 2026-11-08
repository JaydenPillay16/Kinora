
import { LogOut, Menu, X } from "lucide-react";
import KinoraLogo from "../branding/KinoraLogo";
import ThemeToggle from "../branding/ThemeToggle";

interface HeaderProps {
  onSignOut: () => void;
  onMenuClick: () => void;
  isMobileMenuOpen: boolean;
  activeSection: string;
}

const sectionLabels: Record<string, string> = {
  overview: "Overview",
  analytics: "At a glance",
  agents: "My agents",
  contacts: "Contacts",
  schedule: "Schedule",
  history: "History",
  "whatsapp-composer": "Compose",
};

function Header({ onSignOut, onMenuClick, isMobileMenuOpen, activeSection }: HeaderProps) {
  return (
    <header className="app-transition sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-[var(--app-border)] bg-[var(--app-surface)] px-4 sm:px-6 lg:px-8">
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
          <div className="flex items-center gap-2">
            <h1 className="dashboard-page-title relative truncate text-lg font-medium text-[var(--app-text)] sm:text-[21px]">
              {sectionLabels[activeSection] ?? "Overview"}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <button type="button" aria-label="Sign out" title="Sign out" className="header-signout" onClick={onSignOut}><LogOut size={17} /></button>
      </div>
    </header>
  );
}

export default Header;
