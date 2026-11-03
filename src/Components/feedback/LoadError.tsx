import { RefreshCw, TriangleAlert } from "lucide-react";

interface LoadErrorProps {
  title: string;
  onRetry: () => void;
}

export default function LoadError({ title, onRetry }: LoadErrorProps) {
  return (
    <div className="load-error-panel surface flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" role="alert">
      <div className="flex items-start gap-3">
        <span className="load-error-icon mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"><TriangleAlert size={17} /></span>
        <div>
          <h3 className="text-sm font-semibold text-[var(--app-text)]">{title} couldn't load</h3>
          <p className="mt-1 text-sm text-[var(--app-text-muted)]">Check your connection and try again.</p>
        </div>
      </div>
      <button type="button" onClick={onRetry} className="load-error-retry inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-[var(--app-border)] px-4 py-2.5 text-sm font-semibold text-[var(--app-text)] transition hover:-translate-y-0.5 hover:bg-[var(--app-surface-secondary)] sm:self-auto">
        <RefreshCw size={15} />Try again
      </button>
    </div>
  );
}
