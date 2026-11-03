
import type { Agent } from "./types";
import { CalendarClock, Pencil, Pause, Play, Trash2 } from "lucide-react";

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
    <article className="agent-detail-card surface group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="agent-avatar flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ring-1 ring-[var(--app-border)]">
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

        <div className="agent-schedule mt-5 rounded-2xl border border-[var(--app-border)] p-4">
          <div className="flex items-center gap-2">
            <CalendarClock size={15} className="text-[var(--app-accent)]" aria-hidden="true" />
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
            className="agent-action agent-edit-action group/edit inline-flex items-center gap-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] px-3.5 py-2 text-sm font-semibold text-[var(--app-text)] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
          >
            <Pencil size={14} className="transition-transform duration-300 group-hover/edit:-rotate-12 group-hover/edit:scale-110" aria-hidden="true" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onToggleStatus(agent.id)}
            className="agent-action agent-toggle-action group/toggle inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-focus-ring)]"
          >
            {agent.status === "active" ? <Pause size={14} className="transition-transform duration-300 group-hover/toggle:scale-110" aria-hidden="true" /> : <Play size={14} className="transition-transform duration-300 group-hover/toggle:translate-x-0.5 group-hover/toggle:scale-110" aria-hidden="true" />}
            {agent.status === "active" ? "Pause agent" : "Activate agent"}
          </button>

          <button
            type="button"
            onClick={() => onDelete(agent.id)}
            className="agent-action agent-delete-action group/delete ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            <Trash2 size={14} className="transition-transform duration-300 group-hover/delete:-rotate-6 group-hover/delete:scale-110" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default AgentCard;
