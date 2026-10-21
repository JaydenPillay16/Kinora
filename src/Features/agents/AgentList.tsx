import AgentCard from "./AgentCard";
import type { Agent } from "./types";

interface AgentListProps {
  agents: Agent[];
  onEdit: (agent: Agent) => void;
  onToggleStatus: (agentId: string) => void;
  onDelete: (agentId: string) => void;
}

function AgentList({
  agents,
  onEdit,
  onToggleStatus,
  onDelete,
}: AgentListProps) {
  if (agents.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-kinora-border bg-white px-6 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-kinora-mint text-xl text-kinora-primary">
          ✳
        </div>

        <h3 className="mt-4 font-semibold">No agents yet</h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-kinora-muted">
          Your messaging agents will appear here once you create your first one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default AgentList;
