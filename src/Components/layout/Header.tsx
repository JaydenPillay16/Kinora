
import {
  Bell,
  ChevronRight,
  Command,
  Sparkles,
} from "lucide-react";

function Header() {
  return (
    <header className="app-transition sticky top-0 z-20 flex min-h-[84px] items-center justify-between gap-4 border-b border-[var(--app-border)] bg-[var(--app-surface)]/95 px-5 backdrop-blur-xl sm:px-8">
      {/* Page identity */}
      <div className="min-w-0">
        <nav
          aria-label="Breadcrumb"
          className="mb-1.5 flex items-center gap-2 text-xs"
        >
          <span className="font-medium text-[var(--app-text-muted)]">
            Workspace
          </span>

          <ChevronRight
            size={13}
            strokeWidth={1.8}
            aria-hidden="true"
            className="text-[var(--app-text-muted)]"
          />

          <span className="font-semibold text-[var(--app-accent)]">
            Overview
          </span>
        </nav>

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight text-[var(--app-text)] sm:text-2xl">
            Your dashboard
          </h1>

          <span className="hidden items-center gap-1.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-secondary)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--app-text-muted)] sm:inline-flex">
            <Sparkles
              size={12}
              strokeWidth={2}
              className="text-[var(--app-accent)]"
              aria-hidden="true"
            />
            Your personal space
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Notifications — visual button until notifications are implemented */}
        <button
          type="button"
          aria-label="Notifications (coming soon)"
          title="Notifications"
          className="app-transition group relative flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text-muted)] hover:border-[var(--app-accent)]/40 hover:bg-[var(--app-surface-secondary)] hover:text-[var(--app-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
        >
          <Bell
            size={19}
            strokeWidth={1.8}
            className="transition-transform duration-200 group-hover:-rotate-6"
          />
        </button>

        <div
          aria-hidden="true"
          className="mx-1 hidden h-8 w-px bg-[var(--app-border)] sm:block"
        />

        {/* Profile identity */}
        <button
          type="button"
          title="Your profile"
          aria-label="Your profile"
          className="app-transition group flex items-center gap-2.5 rounded-xl p-1.5 pr-2 hover:bg-[var(--app-surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)] sm:gap-3 sm:pr-3"
        >
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#065F46] to-[#10B981] text-sm font-bold text-white shadow-sm ring-1 ring-emerald-700/10 transition-transform duration-200 group-hover:scale-105 dark:from-[#34D399] dark:to-[#6EE7B7] dark:text-[#0B1713]">
            Y
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--app-surface)] bg-[var(--app-accent)]" />
          </span>

          <span className="hidden text-left sm:block">
            <span className="block text-xs font-semibold text-[var(--app-text)]">
              Your account
            </span>
            <span className="mt-0.5 block text-[11px] text-[var(--app-text-muted)]">
              Personal workspace
            </span>
          </span>

          <Command
            size={15}
            strokeWidth={1.8}
            aria-hidden="true"
            className="hidden text-[var(--app-text-muted)] transition-colors group-hover:text-[var(--app-accent)] lg:block"
          />
        </button>
      </div>
    </header>
  );
}

export default Header;
