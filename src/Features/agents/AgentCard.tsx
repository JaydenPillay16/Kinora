
import type { Agent } from "./types";

interface AgentCardProps {
  agent: Agent;
  onEdit: (agent: Agent) => void;
  onToggleStatus: (agentId: string) => void;
  onDelete: (agentId: string) => void;
}

function AgentCard({
  agent,
  onEdit,
  onToggleStatus,
  onDelete,
}: AgentCardProps) {
  const statusStyles = {
    active:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20",
    paused:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20",
    draft:
      "bg-[var(--app-surface-secondary)] text-[var(--app-text-muted)] ring-[var(--app-border)]",
  };

  const formattedSchedule = agent.nextScheduledAt
    ? new Date(agent.nextScheduledAt).toLocaleString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <article className="surface group flex h-full flex-col overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--app-surface-secondary)] text-lg font-bold text-[var(--app-accent)] ring-1 ring-[var(--app-border)]">
            {agent.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <h3 className="truncate font-semibold tracking-tight text-[var(--app-text)]">
              {agent.name}
            </h3>

            <p className="mt-1 truncate text-sm text-[var(--app-text-muted)]">
              For {agent.contactName || "Unassigned contact"}
            </p>
          </div>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyles[agent.status]}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                agent.status === "active"
                  ? "bg-emerald-500"
                  : agent.status === "paused"
                    ? "bg-amber-500"
                    : "bg-[var(--app-text-muted)]"
              }`}
            />
            {agent.status}
          </span>
        </div>

        <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--app-text-muted)]">
          {agent.instructions || "No instructions have been added yet."}
        </p>

        <div className="mt-5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-secondary)]/60 p-4">
          <div className="flex items-center gap-2">
            <span className="text-[var(--app-accent)]" aria-hidden="true">
              ◷
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--app-text-muted)]">
              Next scheduled message
            </p>
          </div>

          <p className="mt-2 text-sm font-semibold text-[var(--app-text)]">
            {formattedSchedule ?? "No message scheduled"}
          </p>
        </div>
      </div>

      <div className="mt-auto border-t border-[var(--app-border)] bg-[var(--app-surface-secondary)]/30 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(agent)}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-surface-secondary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(agent.id)}
            className="rounded-lg bg-[var(--app-primary)] px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
          >
            {agent.status === "active" ? "Pause agent" : "Activate agent"}
          </button>

          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                `Delete "${agent.name}"? Any pending scheduled message will also be cancelled.`,
              );

              if (confirmed) {
                onDelete(agent.id);
              }
            }}
            className="ml-auto rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 dark:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default AgentCard;
