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
    active: "bg-emerald-50 text-emerald-700",
    paused: "bg-amber-50 text-amber-700",
    draft: "bg-gray-100 text-gray-600",
  };

  return (
    <article className="rounded-2xl border border-kinora-border bg-white p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kinora-mint text-lg font-bold text-kinora-primary">
            {agent.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-kinora-text">{agent.name}</h3>
            <p className="mt-1 text-sm text-kinora-muted">
              For {agent.contactName}
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[agent.status]}`}
        >
          {agent.status}
        </span>
      </div>

      <p className="mt-5 line-clamp-2 text-sm leading-6 text-kinora-muted">
        {agent.instructions}
      </p>

      <div className="mt-5 border-t border-kinora-border pt-4">
        <p className="text-xs font-medium text-kinora-muted">
          NEXT SCHEDULED MESSAGE
        </p>

        <p className="mt-2 text-sm font-medium text-kinora-text">
          {agent.nextScheduledAt
            ? new Date(agent.nextScheduledAt).toLocaleString()
            : "No message scheduled"}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={() => onEdit(agent)}
          className="rounded-lg border border-kinora-border px-4 py-2 text-sm font-semibold text-kinora-primary transition hover:bg-kinora-background"
        >
          Edit agent
        </button>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onToggleStatus(agent.id)}
          className="rounded-lg border border-kinora-border px-4 py-2 text-sm font-semibold text-kinora-text transition hover:bg-kinora-background"
        >
          {agent.status === "active" ? "Pause agent" : "Resume agent"}
        </button>
      </div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => onDelete(agent.id)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Delete agent
        </button>
      </div>
    </article>
  );
}

export default AgentCard;
